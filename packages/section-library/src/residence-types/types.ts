export interface ResidenceType {
  id: string;
  name: string;
  bedrooms: string;
  areaRange: string;
  description: string;
  imageSrc: string;
  cta: { label: string; href: string };
}

export interface ResidenceTypesContent {
  eyebrow: string;
  types: ResidenceType[];
}
