export interface VideoItem {
  path: string;
}

export interface AboutPage {
  videos: VideoItem[];
  content: any; // Lexical rich text content
}

export async function getAboutPage(): Promise<AboutPage> {
  try {
    const response = await fetch(
      `${import.meta.env.PUBLIC_PAYLOAD_URL}/api/globals/about-page`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch About page: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      videos: data.videos || [],
      content: data.content,
    };
  } catch (error) {
    console.error("Error fetching About page:", error);
    return {
      videos: [],
      content: null,
    };
  }
}
