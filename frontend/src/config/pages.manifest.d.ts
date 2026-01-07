declare module "@/config/pages.manifest.json" {
  export interface PageEntry {
    slug: string;
    path: string;
    title: string;
  }

  export interface PageMetadata {
    title: string;
    description: string;
  }

  export interface PagesManifest {
    pages: PageEntry[];
    metadata: Record<string, PageMetadata>;
  }

  const manifest: PagesManifest;
  export default manifest;
}

