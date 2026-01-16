export interface ShopifyCollection {
  id: string;
  title: string;
  handle: string;
  updatedAt: string;
}

export async function getShopifyCollections(): Promise<ShopifyCollection[]> {
  try {
    const response = await fetch(
      `${import.meta.env.PUBLIC_PAYLOAD_URL}/api/shopify/collections`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch collections: ${response.statusText}`);
    }

    const data = await response.json();

    if (data?.edges && Array.isArray(data.edges)) {
      return data.edges.map(({ node }: any) => node as ShopifyCollection);
    }

    return [];
  } catch (error) {
    console.error("Error fetching collections:", error);
    return [];
  }
}