import React, { useState, useEffect } from 'react';
import { Layout, Plus, X, MapPin, Mail, FileText, Save, Clock, Server, AlertCircle, Calendar } from 'lucide-react';
import type { Template } from '../features/templates/types';
import type { EmailEntry } from './Emails';
import { TemplatesContext } from '../App';
import { useEmails } from '../contexts/EmailContext';
import { supabase } from '../lib/supabase';

interface EmailWithRate extends EmailEntry {
  sendingRate?: number;
  smtpProvider: 'amazon' | 'gmail';
}

interface Campaign {
  id: string;
  name: string;
  isActive: boolean;
  city: string;
  subjectLines: string[];
  daysTillClose: string;
  templates: {
    template: Template;
    type: 'body' | 'attachment';
  }[];
  emails: EmailWithRate[];
  lastModified: string;
}

interface AppPageProps {
  onSignOut: () => void;
  currentView: string;
}

const cities = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose'
];

// Generate days till close options (1-21 days and NA)
const daysTillCloseOptions = [
  { value: 'NA', label: 'Not Applicable' },
  ...Array.from({ length: 21 }, (_, i) => ({ 
    value: (i + 1).toString(), 
    label: `${i + 1} ${i === 0 ? 'Day' : 'Days'}` 
  }))
];

export function AppPage({ onSignOut, currentView }: AppPageProps) {
  const { templates } = React.useContext(TemplatesContext);
  const { sesEmails, googleEmails } = useEmails();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  const availableEmails: EmailEntry[] = [
    ...sesEmails.map(email => ({ address: email.address, smtpProvider: 'amazon' as const })),
    ...googleEmails.map(email => ({ address: email.address, smtpProvider: 'gmail' as const }))
  ];

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    const allEmailAddresses = new Set(availableEmails.map(email => email.address));
    setCampaigns(prevCampaigns => 
      prevCampaigns.map(campaign => ({
        ...campaign,
        emails: campaign.emails.filter(email => allEmailAddresses.has(email.address))
      }))
    );
  }, [sesEmails, googleEmails]);

  const validateCampaign = (campaign: Campaign) => {
    if (campaign.emails.length === 0) {
      return { valid: false, reason: 'At least one sender email is required' };
    }
    if (!campaign.city) {
      return { valid: false, reason: 'A target city must be selected' };
    }
    if (campaign.subjectLines.length === 0) {
      return { valid: false, reason: 'At least one subject line is required' };
    }
    if (!campaign.templates.some(t => t.type === 'body')) {
      return { valid: false, reason: 'A body template is required' };
    }
    return { valid: true };
  };

  const fetchCampaigns = async () => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          *,
          campaign_templates(
            templates(*),
            template_type
          ),
          campaign_emails(*)
        `)
        .eq('user_id', user.data.user.id)
        .order('updated_at', { ascending: false });

      if (campaignsError) throw campaignsError;

      const transformedCampaigns: Campaign[] = campaignsData.map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        isActive: campaign.is_active,
        city: campaign.city,
        subjectLines: campaign.subject_lines || [],
        daysTillClose: campaign.days_till_close || 'NA',
        templates: campaign.campaign_templates.map((ct: any) => ({
          template: ct.templates,
          type: ct.template_type
        })),
        emails: campaign.campaign_emails.map((ce: any) => ({
          address: ce.email_address,
          smtpProvider: ce.provider,
          sendingRate: ce.sending_rate
        })),
        lastModified: campaign.updated_at
      }));

      setCampaigns(transformedCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      alert('Failed to load campaigns. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCampaign = () => {
    const newCampaign: Campaign = {
      id: '',
      name: 'New Campaign',
      isActive: false,
      city: cities[0],
      subjectLines: [],
      daysTillClose: 'NA',
      templates: [],
      emails: [],
      lastModified: new Date().toISOString()
    };
    setCurrentCampaign(newCampaign);
  };

  const handleSaveCampaign = async (name: string) => {
    if (!currentCampaign) return;

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      const now = new Date().toISOString();
      let campaignId = currentCampaign.id;

      if (!campaignId) {
        const { data: campaign, error: campaignError } = await supabase
          .from('campaigns')
          .insert({
            user_id: user.data.user.id,
            name,
            is_active: false,
            city: currentCampaign.city,
            subject_lines: currentCampaign.subjectLines,
            days_till_close: currentCampaign.daysTillClose,
            updated_at: now
          })
          .select()
          .single();

        if (campaignError) throw campaignError;
        campaignId = campaign.id;
      } else {
        const { error: updateError } = await supabase
          .from('campaigns')
          .update({
            name,
            is_active: false,
            subject_lines: currentCampaign.subjectLines,
            days_till_close: currentCampaign.daysTillClose,
            updated_at: now
          })
          .eq('id', campaignId);

        if (updateError) throw updateError;
      }

      await supabase
        .from('campaign_templates')
        .delete()
        .eq('campaign_id', campaignId);

      await supabase
        .from('campaign_emails')
        .delete()
        .eq('campaign_id', campaignId);

      if (currentCampaign.templates.length > 0) {
        const { error: templatesError } = await supabase
          .from('campaign_templates')
          .insert(
            currentCampaign.templates.map(({ template, type }) => ({
              campaign_id: campaignId,
              template_id: template.id,
              template_type: type
            }))
          );

        if (templatesError) throw templatesError;
      }

      if (currentCampaign.emails.length > 0) {
        const { error: emailsError } = await supabase
          .from('campaign_emails')
          .insert(
            currentCampaign.emails.map(email => ({
              campaign_id: campaignId,
              email_address: email.address,
              provider: email.smtpProvider,
              sending_rate: email.sendingRate || 1440,
              updated_at: now
            }))
          );

        if (emailsError) throw emailsError;
      }

      await fetchCampaigns();
      setCurrentCampaign(null);
    } catch (error) {
      console.error('Error saving campaign:', error);
      alert('Failed to save campaign. Please try again.');
    }
  };

  const handleUpdateCampaign = (updates: Partial<Campaign>) => {
    if (!currentCampaign) return;
    setCurrentCampaign({
      ...currentCampaign,
      ...updates,
      lastModified: new Date().toISOString()
    });
  };

  const handleAddTemplate = () => {
    if (!selectedTemplateId || !currentCampaign) return;
    
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;

    if (currentCampaign.templates.some(t => t.template.id === template.id)) {
      alert('This template has already been added to the campaign.');
      return;
    }

    // Determine template type based on format
    const templateType = template.format === 'html' ? 'body' : 'attachment';

    // Check if we already have a body template and trying to add another one
    if (templateType === 'body' && currentCampaign.templates.some(t => t.type === 'body')) {
      alert('Only one HTML template can be used as the email body. Please remove the existing body template first.');
      return;
    }

    handleUpdateCampaign({
      templates: [...currentCampaign.templates, { template, type: templateType }]
    });
    setSelectedTemplateId('');
  };

  const handleAddSubjectLine = () => {
    if (!currentCampaign) return;
    
    const newSubjectLine = document.getElementById('newSubjectLine') as HTMLInputElement;
    if (!newSubjectLine || !newSubjectLine.value.trim()) return;
    
    handleUpdateCampaign({
      subjectLines: [...(currentCampaign.subjectLines || []), newSubjectLine.value.trim()]
    });
    newSubjectLine.value = '';
  };

  const handleRemoveSubjectLine = (index: number) => {
    if (!currentCampaign) return;
    const newSubjectLines = [...currentCampaign.subjectLines];
    newSubjectLines.splice(index, 1);
    handleUpdateCampaign({ subjectLines: newSubjectLines });
  };

  const handleRemoveTemplate = async (templateId: string) => {
    if (!currentCampaign) return;
    try {
      if (currentCampaign.id) {
        const { error } = await supabase
          .from('campaign_templates')
          .delete()
          .eq('campaign_id', currentCampaign.id)
          .eq('template_id', templateId);

        if (error) throw error;
      }
      const updatedTemplates = currentCampaign.templates.filter(t => t.template.id !== templateId);
      handleUpdateCampaign({ templates: updatedTemplates });
    } catch (error) {
      console.error('Error removing template:', error);
      alert('Failed to remove template. Please try again.');
    }
  };

  const handleAddEmail = (email: EmailEntry) => {
    if (!currentCampaign) return;
    handleUpdateCampaign({
      emails: [...currentCampaign.emails, { ...email, sendingRate: 1440 }]
    });
  };

  const handleRemoveEmail = async (email: EmailWithRate) => {
    if (!currentCampaign) return;
    try {
      if (currentCampaign.id) {
        const { error } = await supabase
          .from('campaign_emails')
          .delete()
          .eq('campaign_id', currentCampaign.id)
          .eq('email_address', email.address);

        if (error) throw error;
      }
      const updatedEmails = currentCampaign.emails.filter(e => e.address !== email.address);
      handleUpdateCampaign({ emails: updatedEmails });
    } catch (error) {
      console.error('Error removing email:', error);
      alert('Failed to remove email. Please try again.');
    }
  };

  const handleUpdateEmailRate = (email: EmailWithRate, rate: number) => {
    if (!currentCampaign) return;
    handleUpdateCampaign({
      emails: currentCampaign.emails.map(e => 
        e.address === email.address ? { ...e, sendingRate: rate } : e
      )
    });
  };

  const handleDeleteCampaign = async (id: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign. Please try again.');
    }
  };

  const handleToggleActive = async (campaignId: string, isActive: boolean) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const validation = validateCampaign(campaign);
    if (isActive && !validation.valid) {
      alert(validation.reason);
      return;
    }

    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString()
        })
        .eq('id', campaignId);

      if (error) throw error;

      setCampaigns(prev => 
        prev.map(c => 
          c.id === campaignId 
            ? { ...c, isActive, lastModified: new Date().toISOString() }
            : c
        )
      );
    } catch (error) {
      console.error('Error updating campaign status:', error);
      alert('Failed to update campaign status. Please try again.');
    }
  };

  const handleCampaignClick = (e: React.MouseEvent, campaign: Campaign) => {
    const target = e.target as HTMLElement;
    if (target.closest('.toggle-wrapper') || target.closest('.delete-button')) {
      return;
    }

    if (campaign.isActive) {
      alert('Cannot edit an active campaign. Please deactivate it first.');
      return;
    }
    
    setCurrentCampaign(campaign);
  };

  if (isLoading) {
    return (
      <div className="p-8 bg-white dark:bg-gray-900 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        {!currentCampaign ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Layout className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Campaigns</h1>
              </div>
              <button
                onClick={handleCreateCampaign}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </button>
            </div>

            <div className="space-y-4">
              {campaigns.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                  <Layout className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No campaigns yet
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Create your first campaign to get started
                  </p>
                </div>
              ) : (
                campaigns.map((campaign) => {
                  const validation = validateCampaign(campaign);
                  const validationMessage = !validation.valid ? validation.reason : '';
                  const hasBodyTemplate = campaign.templates.some(t => t.type === 'body');

                  return (
                    <div
                      key={campaign.id}
                      onClick={(e) => handleCampaignClick(e, campaign)}
                      className={`bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 ${
                        !campaign.isActive ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Layout className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                          <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                              {campaign.name}
                            </h3>
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                <MapPin className="w-4 h-4" />
                                {campaign.city}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                <FileText className="w-4 h-4" />
                                {campaign.templates.length} templates
                                {hasBodyTemplate && (
                                  <span className="text-xs text-green-500">(has body)</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                <Mail className="w-4 h-4" />
                                {campaign.emails.length} emails
                              </div>
                              {campaign.daysTillClose !== 'NA' && (
                                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                  <Calendar className="w-4 h-4" />
                                  {campaign.daysTillClose} days till close
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="toggle-wrapper">
                            <div className="flex items-center gap-2">
                              <div className="relative inline-block w-11 align-middle select-none">
                                <input
                                  type="checkbox"
                                  checked={campaign.isActive}
                                  onChange={(e) => handleToggleActive(campaign.id, e.target.checked)}
                                  className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                                />
                                <div className={`toggle-label block overflow-hidden h-6 rounded-full ${
                                  !validation.valid
                                    ? 'bg-gray-300 dark:bg-gray-600'
                                    : campaign.isActive
                                      ? 'bg-indigo-600'
                                      : 'bg-gray-300 dark:bg-gray-600'
                                }`}></div>
                              </div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {campaign.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Are you sure you want to delete this campaign?')) {
                                handleDeleteCampaign(campaign.id);
                              }
                            }}
                            className="delete-button p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      {!validation.valid && (
                        <div className="mt-4 flex items-center gap-2 text-amber-600 dark:text-amber-500">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">{validationMessage}</span>
                        </div>
                      )}
                      {campaign.isActive && (
                        <div className="mt-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
                          <AlertCircle className="w-4 h-4" />
                          <span className="text-sm">Deactivate campaign to edit</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Layout className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                <input
                  type="text"
                  value={currentCampaign.name}
                  onChange={(e) => handleUpdateCampaign({ name: e.target.value })}
                  className="text-2xl font-bold bg-transparent border-none focus:ring-0 text-gray-900 dark:text-white"
                  placeholder="Campaign Name"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentCampaign(null)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveCampaign(currentCampaign.name)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Campaign
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Campaign Settings</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target City
                    </label>
                    {currentCampaign.id ? (
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-900 dark:text-white">
                        {currentCampaign.city}
                      </div>
                    ) : (
                      <select
                        value={currentCampaign.city}
                        onChange={(e) => handleUpdateCampaign({ city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {cities.map(city => (
                          <option key={city} value={city}>{city}</option>
                        ))}
                      </select>
                    )}
                    {currentCampaign.id && (
                      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Target city cannot be changed after campaign creation. Create a new campaign to target a different city.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Days Till Close
                    </label>
                    <select
                      value={currentCampaign.daysTillClose}
                      onChange={(e) => handleUpdateCampaign({ daysTillClose: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {daysTillCloseOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Select the number of days until close or "Not Applicable" if not relevant.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Subject Lines
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          id="newSubjectLine"
                          placeholder="Enter a subject line"
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                        <button
                          onClick={handleAddSubjectLine}
                          className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Add Subject Line
                        </button>
                      </div>
                      {currentCampaign.subjectLines?.length > 0 ? (
                        <div className="space-y-2">
                          {currentCampaign.subjectLines.map((subject, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                              <span className="text-gray-900 dark:text-white">{subject}</span>
                              <button
                                onClick={() => handleRemoveSubjectLine(index)}
                                className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          No subject lines added yet
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Templates
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <select
                          value={selectedTemplateId}
                          onChange={(e) => setSelectedTemplateId(e.target.value)}
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                          <option value="">Select a template</option>
                          {templates
                            .filter(t => {
                              // Filter out templates that are already added
                              if (currentCampaign.templates.some(ct => ct.template.id === t.id)) {
                                return false;
                              }
                              
                              // Filter out HTML templates if we already have a body template
                              if (t.format === 'html' && currentCampaign.templates.some(ct => ct.type === 'body')) {
                                return false;
                              }
                              
                              return true;
                            })
                            .map(template => (
                              <option key={template.id} value={template.id}>
                                {template.name} ({template.format.toUpperCase()}) - {template.format === 'html' ? 'Body' : 'Attachment'}
                              </option>
                            ))
                          }
                        </select>
                        <button
                          onClick={handleAddTemplate}
                          disabled={!selectedTemplateId}
                          className="px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed"
                        >
                          Add Template
                        </button>
                      </div>
                      
                      <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Note:</strong> HTML templates can only be used as email bodies, and DOCX templates can only be used as attachments. 
                          Only one HTML template can be used as the email body.
                        </p>
                      </div>
                      
                      {currentCampaign.templates.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {currentCampaign.templates.map(({ template, type }) => (
                            <div
                              key={template.id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {template.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {template.format.toUpperCase()}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                                  <span className={`text-xs ${type === 'body' ? 'text-green-500 dark:text-green-400' : 'text-blue-500 dark:text-blue-400'}`}>
                                    {type === 'body' ? 'Body Template' : 'Attachment'}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveTemplate(template.id)}
                                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Sender Emails
                    </label>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <select
                          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          onChange={(e) => {
                            const email = availableEmails.find(email => email.address === e.target.value);
                            if (email) handleAddEmail(email);
                          }}
                          value=""
                        >
                          <option value="">Select an email</option>
                          {availableEmails
                            .filter(email => !currentCampaign.emails.some(e => e.address === email.address))
                            .map(email => (
                              <option key={email.address} value={email.address}>
                                {email.address} ({email.smtpProvider === 'amazon' ? 'Amazon SES' : 'Gmail'})
                              </option>
                            ))
                          }
                        </select>
                      </div>
                      {currentCampaign.emails.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {currentCampaign.emails.map((email) => (
                            <div
                              key={email.address}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                            >
                              <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                                  {email.address}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {email.smtpProvider === 'amazon' ? 'Amazon SES' : 'Gmail'}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">•</span>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <input
                                      type="number"
                                      min="1"
                                      max="1440"
                                      value={email.sendingRate || 1440}
                                      onChange={(e) => handleUpdateEmailRate(email, parseInt(e.target.value, 10))}
                                      className="w-16 px-1 py-0.5 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                    />
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      emails/day
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleRemoveEmail(email)}
                                className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}