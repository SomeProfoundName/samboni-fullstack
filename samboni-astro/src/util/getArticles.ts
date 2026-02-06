export interface Media {
  id: string;
  url: string;
  alt: string;
  filename: string;
  width?: number;
  height?: number;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  coverImage?: Media;
  excerpt?: string;
  content: any;
  publishedAt?: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

export interface ArticlesResponse {
  docs: Article[];
  totalDocs: number;
  limit: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface GetArticlesOptions {
  limit?: number;
  page?: number;
  status?: 'draft' | 'published';
  sort?: string;
}

export async function getArticles(options: GetArticlesOptions = {}): Promise<ArticlesResponse> {
  const { limit = 10, page = 1, status = 'published', sort = '-publishedAt' } = options;

  try {
    const params = new URLSearchParams({
      limit: String(limit),
      page: String(page),
      sort,
      'where[status][equals]': status,
      depth: '1',
    });

    const response = await fetch(
      `${import.meta.env.PUBLIC_PAYLOAD_URL}/api/articles?${params}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch articles: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching articles:", error);
    return {
      docs: [],
      totalDocs: 0,
      limit,
      totalPages: 0,
      page,
      hasNextPage: false,
      hasPrevPage: false,
    };
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const params = new URLSearchParams({
      'where[slug][equals]': slug,
      depth: '1',
    });

    const response = await fetch(
      `${import.meta.env.PUBLIC_PAYLOAD_URL}/api/articles?${params}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch article: ${response.statusText}`);
    }

    const data: ArticlesResponse = await response.json();
    return data.docs[0] || null;
  } catch (error) {
    console.error("Error fetching article by slug:", error);
    return null;
  }
}
