import type { WeldingLocationPreset } from "@/stores/welding-profile-store";

export const WELDING_LOCATION_PRESETS: WeldingLocationPreset[] = [
  { id: "manila", label: "Manila, PH", lat: 14.5995, lng: 120.9842 },
  { id: "qc", label: "Quezon City, PH", lat: 14.676, lng: 121.0437 },
  { id: "cebu", label: "Cebu City, PH", lat: 10.3157, lng: 123.8854 },
  { id: "davao", label: "Davao City, PH", lat: 7.1907, lng: 125.4553 },
  { id: "subic", label: "Subic, PH", lat: 14.87999, lng: 120.23433 },
];

export const WELDING_SPECIALIZATIONS = [
  "SMAW (Stick)",
  "GMAW (MIG)",
  "GTAW (TIG)",
  "FCAW",
  "Structural",
  "Pipeline",
  "Shipyard",
  "Underwater",
  "Stainless/Aluminum",
  "Blueprint Reading",
  "Safety/QA",
];

export type CertificationEntry = {
  id: string;
  name: string;
  issuer: "AWS" | "API" | "ASME" | "TESDA";
  summary: string;
  link: string;
};

export type TrainingEntry = {
  id: string;
  name: string;
  location: string;
  summary: string;
  link: string;
};

export type BusinessIdea = {
  id: string;
  name: string;
  summary: string;
  marketNotes: string[];
  steps: string[];
};

export type WeldingAdviceData = {
  note: string;
  jobPaths: Array<{
    id: string;
    title: string;
    salaryRange: string;
    requirements: string[];
  }>;
  certifications: CertificationEntry[];
  trainingPrograms: TrainingEntry[];
  businessIdeas: BusinessIdea[];
};

export const WELDING_ADVICE_DATA: WeldingAdviceData = {
  note:
    "Demo-only: this portal is welding-focused because the current dataset available is welding (TESDA SMAW).",
  jobPaths: [
    {
      id: "structural",
      title: "Structural Welder",
      salaryRange: "$18–$35/hr (varies by region/project)",
      requirements: ["SMAW/GMAW basics", "Blueprint reading", "Safety training"],
    },
    {
      id: "pipeline",
      title: "Pipeline Welder",
      salaryRange: "$25–$60/hr (often project-based)",
      requirements: ["Pipe welding (6G)", "API-focused procedures", "Field work readiness"],
    },
    {
      id: "underwater",
      title: "Underwater Welder",
      salaryRange: "$60k–$200k/yr (high variance, high risk)",
      requirements: ["Commercial diving cert", "Wet welding training", "Strong safety profile"],
    },
  ],
  certifications: [
    {
      id: "aws-d11",
      name: "AWS D1.1 Structural Welding",
      issuer: "AWS",
      summary: "Common structural welding code and qualification pathway.",
      link: "https://www.aws.org/certification",
    },
    {
      id: "api-1104",
      name: "API 1104 Pipeline Welding",
      issuer: "API",
      summary: "Pipeline welding standard; often referenced on pipeline projects.",
      link: "https://www.api.org/products-and-services/standards",
    },
    {
      id: "asme-ix",
      name: "ASME Section IX Qualifications",
      issuer: "ASME",
      summary: "Qualification rules used in many industrial/pressure applications.",
      link: "https://www.asme.org/codes-standards",
    },
    {
      id: "tesda-smaw",
      name: "TESDA SMAW NC II",
      issuer: "TESDA",
      summary: "Core SMAW certification commonly used in the Philippines.",
      link: "https://www.tesda.gov.ph/",
    },
  ],
  trainingPrograms: [
    {
      id: "tesda-center",
      name: "TESDA Training Center (Search)",
      location: "Philippines",
      summary: "Find accredited training centers and schedules.",
      link: "https://www.tesda.gov.ph/",
    },
    {
      id: "aws-schools",
      name: "AWS Training & Schools (Directory)",
      location: "Global",
      summary: "Directory for training resources aligned with AWS certifications.",
      link: "https://www.aws.org/",
    },
  ],
  businessIdeas: [
    {
      id: "mobile-welding",
      name: "Mobile Welding Services",
      summary: "On-site repair and fabrication for gates, grills, farm tools, and small contractors.",
      marketNotes: [
        "High demand for fast turnaround repairs",
        "Low overhead if you already have tools",
        "Differentiator: reliability + clear pricing",
      ],
      steps: [
        "Define services and price list (repairs, fabrication, installation)",
        "Build a simple portfolio with before/after photos",
        "Set safety checklist + basic contract template",
        "Partner with local contractors and hardware stores",
      ],
    },
    {
      id: "metal-fabrication",
      name: "Small Metal Fabrication Shop",
      summary: "Produce custom metalwork: frames, racks, signage, and brackets.",
      marketNotes: [
        "B2B repeat customers possible (shops, warehouses)",
        "Quality control and consistent lead times matter",
      ],
      steps: [
        "Start with 2–3 repeatable products",
        "Source material suppliers and track costs",
        "Document welding procedures and quality checks",
        "Scale by hiring helpers and standardizing jigs",
      ],
    },
  ],
};

