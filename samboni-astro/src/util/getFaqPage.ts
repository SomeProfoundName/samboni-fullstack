export interface FaqItem {
  question: string;
  answer: any; // Lexical rich text content
}

export interface FaqPage {
  faqItems: FaqItem[];
}

export async function getFaqPage(): Promise<FaqPage> {
  try {
    const response = await fetch(
      `${import.meta.env.PUBLIC_PAYLOAD_URL}/api/globals/faq-page`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch FAQ page: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      faqItems: data.faqItems || [],
    };
  } catch (error) {
    console.error("Error fetching FAQ page:", error);
    return {
      faqItems: [],
    };
  }
}
