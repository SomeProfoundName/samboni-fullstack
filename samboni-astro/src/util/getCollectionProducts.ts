export interface ShopifyImage {
    url: string;
    altText: string | null;
}

export interface ShopifyPrice {
    amount: string;
    currencyCode: string;
}

export interface ShopifyVariant {
    id: string;
    title: string;
    availableForSale: boolean;
    quantityAvailable: number;
}

export interface ShopifyProduct {
    id: string;
    title: string;
    handle: string;
    description: string;
    priceRange: {
        minVariantPrice: ShopifyPrice;
    };
    variants: {
        edges: Array<{
            node: ShopifyVariant;
        }>;
    };
    images: {
        edges: Array<{
            node: ShopifyImage;
        }>;
    };
}

export async function getCollectionProducts(handle: string): Promise<ShopifyProduct[]> {
    try {
        const response = await fetch(
            `${import.meta.env.PUBLIC_PAYLOAD_URL}/api/shopify/collections/${handle}/products`
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch products: ${response.statusText}`);
        }

        const data = await response.json();

        if (data?.edges && Array.isArray(data.edges)) {
            return data.edges.map(({ node }: any) => node as ShopifyProduct);
        }

        return [];
    } catch (error) {
        console.error("Error fetching collection products:", error);
        return [];
    }
}