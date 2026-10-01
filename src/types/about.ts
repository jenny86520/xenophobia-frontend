export type AboutContent = {
  teamProfile?: {
    name: string;
    introduction: string;
    mission: string;
  };
  milestones?: Array<{ id: string; title: string; description: string; date: string }>;
  contactInfo?: Array<{ id: string; label: string; type: string; value: string }>;
  highlights?: string[];
};
