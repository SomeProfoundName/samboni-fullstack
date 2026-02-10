export interface NavItem {
  label: string;
  link: string;
  openInNewTab?: boolean;
  showOnSite?: boolean
}

export interface Navigation {
  brandName: string;
  brandLink: string;
  navItems: NavItem[];
}

export async function getNavigation(): Promise<Navigation> {
  try {
    const response = await fetch(
      `${import.meta.env.PUBLIC_PAYLOAD_URL}/api/globals/navigation`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch navigation: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      brandName: data.brandName || 'Samboni',
      brandLink: data.brandLink || '/',
      navItems: (data.navItems || []).filter((item: NavItem) => item.showOnSite),
    };
  } catch (error) {
    console.error("Error fetching navigation:", error);
    return {
      brandName: 'Samboni',
      brandLink: '/',
      navItems: [],
    };
  }
}
