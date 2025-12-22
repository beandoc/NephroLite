// Message template definitions for patient outreach

export interface MessageTemplate {
    id: string;
    title: string;
    category: 'appointment' | 'diet' | 'medication' | 'labResults' | 'general';
    template: string;
    placeholders: string[]; // List of available placeholders for this template
}

export const MESSAGE_TEMPLATES: MessageTemplate[] = [
    {
        id: 'appointment-reminder',
        title: 'Appointment Reminder',
        category: 'appointment',
        template: 'Dear {patientName}, this is a reminder of your {appointmentType} appointment on {date} at {time}. Please arrive 15 minutes early. Contact us at {clinicPhone} if you need to reschedule.',
        placeholders: ['patientName', 'appointmentType', 'date', 'time', 'clinicPhone']
    },
    {
        id: 'diet-reminder-ckd',
        title: 'CKD Diet Reminder',
        category: 'diet',
        template: 'Hello {patientName}, please remember to follow your prescribed low-protein, low-sodium diet. This is important for managing your {diagnosis}. Limit salt intake to less than 2g per day and protein to {proteinLimit}g per day.',
        placeholders: ['patientName', 'diagnosis', 'proteinLimit']
    },
    {
        id: 'diet-reminder-diabetes',
        title: 'Diabetes Diet Reminder',
        category: 'diet',
        template: 'Dear {patientName}, please maintain your diabetic diet as discussed. Monitor carbohydrate intake and avoid sugary foods. Your target blood sugar is {targetBG} mg/dL.',
        placeholders: ['patientName', 'targetBG']
    },
    {
        id: 'medication-reminder',
        title: 'Medication Reminder',
        category: 'medication',
        template: 'Dear {patientName}, please take your medications as prescribed: {medications}. Take them at the same time each day. Contact us at {clinicPhone} if you have any questions or side effects.',
        placeholders: ['patientName', 'medications', 'clinicPhone']
    },
    {
        id: 'medication-refill',
        title: 'Medication Refill Reminder',
        category: 'medication',
        template: 'Hello {patientName}, your prescription for {medicationName} is due for refill. Please schedule an appointment or contact the clinic at {clinicPhone} to arrange a refill.',
        placeholders: ['patientName', 'medicationName', 'clinicPhone']
    },
    {
        id: 'lab-results-ready',
        title: 'Lab Results Available',
        category: 'labResults',
        template: 'Hello {patientName}, your lab results from {date} are now available. Please schedule a follow-up appointment to discuss the results. Call {clinicPhone} to book.',
        placeholders: ['patientName', 'date', 'clinicPhone']
    },
    {
        id: 'lab-results-urgent',
        title: 'Urgent Lab Results',
        category: 'labResults',
        template: 'Dear {patientName}, your recent lab results require immediate attention. Please contact the clinic at {clinicPhone} as soon as possible to schedule an urgent appointment.',
        placeholders: ['patientName', 'clinicPhone']
    },
    {
        id: 'dialysis-reminder',
        title: 'Dialysis Session Reminder',
        category: 'appointment',
        template: 'Dear {patientName}, reminder for your dialysis session on {date} at {time}. Please ensure you are well hydrated and have taken your pre-dialysis medications. See you soon!',
        placeholders: ['patientName', 'date', 'time']
    },
    {
        id: 'followup-general',
        title: 'General Follow-up',
        category: 'general',
        template: 'Hello {patientName}, this is a follow-up message regarding your recent visit on {visitDate}. Please continue following the treatment plan discussed. Contact us at {clinicPhone} if you have any concerns.',
        placeholders: ['patientName', 'visitDate', 'clinicPhone']
    },
    {
        id: 'health-education',
        title: 'Health Education',
        category: 'general',
        template: 'Dear {patientName}, we have sent you educational material about {topic}. Please review it carefully. Understanding your condition is key to better health outcomes. Call {clinicPhone} with questions.',
        placeholders: ['patientName', 'topic', 'clinicPhone']
    }
];

// Helper function to fill template with patient data
export function fillTemplate(template: string, data: Record<string, string>): string {
    let filled = template;
    Object.keys(data).forEach(key => {
        const placeholder = `{${key}}`;
        filled = filled.replace(new RegExp(placeholder, 'g'), data[key] || `[${key}]`);
    });
    return filled;
}

// Get templates by category
export function getTemplatesByCategory(category: MessageTemplate['category']): MessageTemplate[] {
    return MESSAGE_TEMPLATES.filter(t => t.category === category);
}

// Get template by ID
export function getTemplateById(id: string): MessageTemplate | undefined {
    return MESSAGE_TEMPLATES.find(t => t.id === id);
}
