export class IconUtils {
  private static readonly SYSTEM_LABELS = [
    'catalog',
    'favorites',
    'shelf',
    'shop',
    'sold-doll',
    'sold',
    'solds',
    'favorite',
    'wishlist',
  ];

  static getClassName(
    iconPath: string | null | undefined,
    defaultIcon = 'icon-crown',
  ): string {
    if (!iconPath) return defaultIcon;

    if (!iconPath.includes('/') && !iconPath.includes('.')) {
      return iconPath;
    }

    try {
      const fileName = iconPath.split('/').pop()?.split('.')[0];
      if (fileName) {
        return `icon-${fileName.toLowerCase().replace(/_/g, '-')}`;
      }
    } catch (e) {
      return defaultIcon;
    }

    return defaultIcon;
  }

  static isCustom(name: string): boolean {
    if (!name) return false;
    return !this.SYSTEM_LABELS.includes(name.toLowerCase().trim());
  }
}
