export interface StoryBeat {
  title: string;
  body: string;
  imageSrc: string;
  imageAlt: string;
}

export interface StoryContent {
  leftCaption: string;
  rightCaption: string;
  tagline: string;
  heading: string;
  headingLines?: [string, string];
  caption: string;
  beats: StoryBeat[];
}
