export type WeldingJob = {
  id: string;
  title: string;
  companyName: string;
  companyAbout: string;
  salaryMin: number;
  salaryMax: number;
  currency: "USD";
  requirements: string[];
  lat: number;
  lng: number;
  distanceMiles: number;
  applyUrl: string;
};

type Location = { lat: number; lng: number };

function milesToDegreesLat(miles: number) {
  return miles / 69.0;
}

function milesToDegreesLng(miles: number, lat: number) {
  const latRad = (lat * Math.PI) / 180;
  const milesPerDeg = 69.172 * Math.cos(latRad);
  return milesPerDeg === 0 ? 0 : miles / milesPerDeg;
}

function randomInRadiusMiles(rng: () => number, radiusMiles: number) {
  const t = 2 * Math.PI * rng();
  const u = rng() + rng();
  const r = u > 1 ? 2 - u : u;
  return { angle: t, radius: r * radiusMiles };
}

function distanceMiles(a: Location, b: Location) {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

function seededRng(seed: number) {
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 1_000_000) / 1_000_000;
  };
}

const JOB_TEMPLATES = [
  {
    title: "Structural Welder",
    salaryMin: 22,
    salaryMax: 38,
    requirements: ["SMAW/GMAW", "Blueprint reading", "Fit-up basics"],
  },
  {
    title: "Pipeline Welder (6G)",
    salaryMin: 28,
    salaryMax: 60,
    requirements: ["6G pipe welding", "API procedures", "Field work readiness"],
  },
  {
    title: "Shipyard Welder",
    salaryMin: 20,
    salaryMax: 40,
    requirements: ["FCAW/SMAW", "Confined-space safety", "Team coordination"],
  },
  {
    title: "Underwater Welder (Trainee)",
    salaryMin: 30,
    salaryMax: 70,
    requirements: ["Diving readiness", "Strong safety habits", "Welding fundamentals"],
  },
  {
    title: "Fabrication Welder",
    salaryMin: 18,
    salaryMax: 35,
    requirements: ["GMAW/TIG a plus", "Grinding/finishing", "Tool discipline"],
  },
];

const COMPANIES = [
  {
    name: "BayanFab Metals",
    about: "Local fabrication shop supporting contractors and warehouses.",
  },
  {
    name: "HarborWorks Ship Repair",
    about: "Shipyard contractor focused on fast-turnaround maintenance.",
  },
  {
    name: "LinePulse Pipeline Services",
    about: "Field welding crews for pipeline construction and repair.",
  },
  {
    name: "AquaForge Industrial Diving",
    about: "Commercial diving and inspection services.",
  },
];

export function generateSyntheticWeldingJobs(options: {
  origin: Location;
  radiusMiles: number;
  count?: number;
  seed?: number;
}): WeldingJob[] {
  const count = Math.max(3, Math.min(20, options.count ?? 12));
  const rng = seededRng(options.seed ?? Math.floor(Date.now() / 1000));

  const jobs: WeldingJob[] = [];
  for (let i = 0; i < count; i++) {
    const template = JOB_TEMPLATES[Math.floor(rng() * JOB_TEMPLATES.length)];
    const company = COMPANIES[Math.floor(rng() * COMPANIES.length)];
    const scatter = randomInRadiusMiles(rng, options.radiusMiles);

    const dLat = milesToDegreesLat(scatter.radius * Math.cos(scatter.angle));
    const dLng = milesToDegreesLng(
      scatter.radius * Math.sin(scatter.angle),
      options.origin.lat
    );

    const lat = options.origin.lat + dLat;
    const lng = options.origin.lng + dLng;

    const miles = distanceMiles(options.origin, { lat, lng });

    jobs.push({
      id: `job_${i}_${Math.floor(rng() * 1_000_000)}`,
      title: template.title,
      companyName: company.name,
      companyAbout: company.about,
      salaryMin: template.salaryMin,
      salaryMax: template.salaryMax,
      currency: "USD",
      requirements: template.requirements,
      lat,
      lng,
      distanceMiles: Math.round(miles * 10) / 10,
      applyUrl: "https://example.com/apply",
    });
  }

  return jobs.sort((a, b) => a.distanceMiles - b.distanceMiles);
}

