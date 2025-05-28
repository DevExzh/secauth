import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

interface BrandIcon {
  component: (props: { size: number }) => React.ReactElement;
  primaryColor: string;
  backgroundColor: {
    light: string;
    dark: string;
  };
}

// Google图标组件
const GoogleIcon = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 1024 1024">
    <Path
      d="M214.101333 512c0-32.512 5.546667-63.701333 15.36-92.928L57.173333 290.218667A491.861333 491.861333 0 0 0 4.693333 512c0 79.701333 18.858667 154.88 52.394667 221.610667l172.202667-129.066667A290.56 290.56 0 0 1 214.101333 512"
      fill="#FBBC05"
    />
    <Path
      d="M516.693333 216.192c72.106667 0 137.258667 25.002667 188.458667 65.962667L854.101333 136.533333C763.349333 59.178667 646.997333 11.392 516.693333 11.392c-202.325333 0-376.234667 113.28-459.52 278.826667l172.373334 128.853333c39.68-118.016 152.832-202.88 287.146666-202.88"
      fill="#EA4335"
    />
    <Path
      d="M516.693333 807.808c-134.357333 0-247.509333-84.864-287.232-202.88l-172.288 128.853333c83.242667 165.546667 257.152 278.826667 459.52 278.826667 124.842667 0 244.053333-43.392 333.568-124.757333l-163.584-123.818667c-46.122667 28.458667-104.234667 43.776-170.026666 43.776"
      fill="#34A853"
    />
    <Path
      d="M1005.397333 512c0-29.568-4.693333-61.44-11.648-91.008H516.650667V614.4h274.602666c-13.696 65.962667-51.072 116.650667-104.533333 149.632l163.541333 123.818667c93.994667-85.418667 155.136-212.650667 155.136-375.850667"
      fill="#4285F4"
    />
  </Svg>
);

// Discord图标组件
const DiscordIcon = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 1024 1024">
    <Circle cx={512} cy={512} r={512} fill="#7A8CD2" />
    <Path
      d="M758.613333 281.207467a1.792 1.792 0 0 0-0.938666-0.8192 591.598933 591.598933 0 0 0-144.298667-44.032 2.218667 2.218667 0 0 0-2.321067 1.0752 398.114133 398.114133 0 0 0-17.954133 36.3008 548.437333 548.437333 0 0 0-162.082133 0 364.663467 364.663467 0 0 0-18.244267-36.317867 2.269867 2.269867 0 0 0-2.321067-1.0752 589.943467 589.943467 0 0 0-144.298666 44.032 2.048 2.048 0 0 0-0.955734 0.8192c-91.904 135.099733-117.077333 266.888533-104.721066 397.038933a2.3552 2.3552 0 0 0 0.9216 1.621334 591.5648 591.5648 0 0 0 177.015466 88.064 2.321067 2.321067 0 0 0 2.491734-0.8192 412.16 412.16 0 0 0 36.215466-57.9584 2.184533 2.184533 0 0 0-1.2288-3.072 390.212267 390.212267 0 0 1-55.296-25.941334 2.269867 2.269867 0 0 1-1.1264-1.792 2.218667 2.218667 0 0 1 0.887467-1.911466c3.7376-2.730667 7.389867-5.563733 10.990933-8.465067a2.2016 2.2016 0 0 1 2.286934-0.3072c116.0192 52.1216 241.629867 52.1216 356.266666 0a2.218667 2.218667 0 0 1 2.321067 0.273067c3.601067 2.9184 7.2704 5.751467 11.008 8.4992a2.2528 2.2528 0 0 1 0.904533 1.911466 2.2016 2.2016 0 0 1-1.092266 1.792 366.0288 366.0288 0 0 1-55.330134 25.9072 2.269867 2.269867 0 0 0-1.314133 1.297067 2.184533 2.184533 0 0 0 0.1024 1.809067 462.506667 462.506667 0 0 0 36.181333 57.941333 2.286933 2.286933 0 0 0 2.491734 0.836267 589.636267 589.636267 0 0 0 177.322666-88.064 2.269867 2.269867 0 0 0 0.904534-1.604267c14.7968-150.459733-24.746667-281.173333-104.789334-397.038933z m-364.168533 317.781333c-34.935467 0-63.709867-31.573333-63.709867-70.314667s28.2112-70.314667 63.709867-70.314666c35.771733 0 64.273067 31.829333 63.709867 70.314666 0 38.741333-28.228267 70.314667-63.709867 70.314667z m235.554133 0c-34.9184 0-63.709867-31.573333-63.709866-70.314667s28.228267-70.314667 63.709866-70.314666c35.771733 0 64.273067 31.829333 63.709867 70.314666 0 38.741333-27.938133 70.314667-63.709867 70.314667z"
      fill="#FFFFFF"
    />
  </Svg>
);

// GitHub图标组件
const GitHubIcon = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 1024 1024">
    <Path
      d="M512 0C229.12 0 0 229.12 0 512c0 226.56 146.56 417.92 350.08 485.76 25.6 4.48 35.2-10.88 35.2-24.32 0-12.16-0.64-52.48-0.64-95.36-128.64 23.68-161.92-31.36-172.16-60.16-5.76-14.72-30.72-60.16-52.48-72.32-17.92-9.6-43.52-33.28-0.64-33.92 40.32-0.64 69.12 37.12 78.72 52.48 46.08 77.44 119.68 55.68 149.12 42.24 4.48-33.28 17.92-55.68 32.64-68.48-113.92-12.8-232.96-56.96-232.96-252.8 0-55.68 19.84-101.76 52.48-137.6-5.12-12.8-23.04-65.28 5.12-135.68 0 0 42.88-13.44 140.8 52.48 40.96-11.52 84.48-17.28 128-17.28 43.52 0 87.04 5.76 128 17.28 97.92-66.56 140.8-52.48 140.8-52.48 28.16 70.4 10.24 122.88 5.12 135.68 32.64 35.84 52.48 81.28 52.48 137.6 0 196.48-119.68 240-233.6 252.8 18.56 16 34.56 46.72 34.56 94.72 0 68.48-0.64 123.52-0.64 140.8 0 13.44 9.6 29.44 35.2 24.32C877.44 929.92 1024 738.56 1024 512 1024 229.12 794.88 0 512 0z"
      fill="#181717"
    />
  </Svg>
);

// Microsoft图标组件
const MicrosoftIcon = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 210 210">
    <Path fill="#F25022" d="M0 0h100v100H0z"/>
    <Path fill="#7FBA00" d="M110 0h100v100H110z"/>
    <Path fill="#00A4EF" d="M0 110h100v100H0z"/>
    <Path fill="#FFB900" d="M110 110h100v100H110z"/>
  </Svg>
);

// Steam图标组件
const SteamIcon = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 1024 1024">
    <Path d="M510.872 0.00004A511.738935 511.738935 0 0 0 0.578065 470.68598l274.473965 113.377986a144.332982 144.332982 0 0 1 89.621989-24.903997L486.810003 382.552991v-2.615999a193.084975 193.084975 0 1 1 193.049976 193.095975h-4.48L501.388001 697.214951c0 2.275 0.193 4.549999 0.193 6.823a144.799982 144.799982 0 0 1-286.766963 28.543996L18.227063 651.159957A511.965935 511.965935 0 1 0 510.792 0.00004h0.069zM321.404024 776.591941L258.540032 750.549945a108.772986 108.772986 0 1 0 59.599993-148.745981l64.967991 26.837996a80.09299 80.09299 0 1 1-61.646992 147.835981v0.114z m487.139938-396.767949A128.661984 128.661984 0 1 0 679.882979 508.439975a128.843984 128.843984 0 0 0 128.662983-128.616983z m-225.061971-0.228a96.661988 96.661988 0 1 1 96.661988 96.661988 96.433988 96.433988 0 0 1-96.661988-96.661988z" fill="#004986" />
  </Svg>
);

// PayPal图标组件
const PayPalIcon = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 1024 1024">
    <Path d="M841.813333 253.269333c-0.938667 5.888-2.005333 11.946667-3.2 18.176-40.576 209.749333-179.498667 282.24-356.864 282.24H391.424a43.946667 43.946667 0 0 0-43.349333 37.376l-46.250667 295.210667-13.098667 83.626667a23.338667 23.338667 0 0 0 22.784 26.88h160.213334a38.613333 38.613333 0 0 0 38.058666-32.682667l1.578667-8.192 30.165333-192.64 1.962667-10.538667a38.613333 38.613333 0 0 1 38.058667-32.768h23.936c155.221333 0 276.736-63.445333 312.234666-246.954666 14.848-76.672 7.168-140.714667-32.085333-185.728a153.301333 153.301333 0 0 0-43.861333-34.005334z" fill="#179BD7" />
    <Path d="M799.317333 236.202667a318.464 318.464 0 0 0-39.509333-8.789334 498.474667 498.474667 0 0 0-79.616-5.845333h-241.28a38.528 38.528 0 0 0-38.058667 32.768L349.525333 581.546667l-1.450666 9.514666a43.946667 43.946667 0 0 1 43.349333-37.376h90.325333c177.365333 0 316.288-72.533333 356.864-282.24 1.237333-6.229333 2.261333-12.288 3.157334-18.176a215.68 215.68 0 0 0-42.453334-17.066666z" fill="#222D65" />
    <Path d="M400.853333 254.293333a38.442667 38.442667 0 0 1 38.058667-32.725333h241.28c28.586667 0 55.296 1.877333 79.616 5.845333 16.512 2.602667 32.768 6.528 48.64 11.690667 11.946667 3.968 23.082667 8.704 33.365333 14.165333 12.074667-77.525333-0.085333-130.304-41.770666-178.133333C754.133333 22.528 671.274667 0 565.248 0H257.365333c-21.632 0-40.106667 15.872-43.477333 37.418667L85.674667 855.466667a26.752 26.752 0 0 0 5.973333 21.461333c5.034667 5.888 12.373333 9.301333 20.096 9.344h190.08l47.701333-304.725333 51.328-327.253334z" fill="#253B80" />
  </Svg>
);

// 品牌图标配置
const BRAND_ICONS: Record<string, BrandIcon> = {
  google: {
    component: GoogleIcon,
    primaryColor: '#4285F4',
    backgroundColor: {
      light: '#F0F4FF',
      dark: '#1A2329'
    }
  },
  discord: {
    component: DiscordIcon,
    primaryColor: '#5865F2',
    backgroundColor: {
      light: '#F0F2FF',
      dark: '#1E1F2E'
    }
  },
  github: {
    component: GitHubIcon,
    primaryColor: '#181717',
    backgroundColor: {
      light: '#F6F8FA',
      dark: '#21262D'
    }
  },
  microsoft: {
    component: MicrosoftIcon,
    primaryColor: '#00A4EF',
    backgroundColor: {
      light: '#F0F8FF',
      dark: '#1A2329'
    }
  },
  steam: {
    component: SteamIcon,
    primaryColor: '#1B2838',
    backgroundColor: {
      light: '#F0F2F5',
      dark: '#1E2328'
    }
  },
  paypal: {
    component: PayPalIcon,
    primaryColor: '#003087',
    backgroundColor: {
      light: '#F0F4FF',
      dark: '#1A1F2E'
    }
  },
  // 其他品牌可以继续添加...
};

export class BrandIconService {
  /**
   * 获取品牌图标
   */
  static getBrandIcon(serviceName: string, size: number = 24): React.ReactElement | null {
    const normalizedName = serviceName.toLowerCase().trim();
    const brand = BRAND_ICONS[normalizedName];
    
    if (!brand) {
      return null;
    }

    try {
      return React.createElement(brand.component, { size });
    } catch (error) {
      console.warn(`Failed to load brand icon for ${serviceName}:`, error);
      return null;
    }
  }

  /**
   * 获取品牌主题色
   */
  static getBrandColor(serviceName: string): string | null {
    const normalizedName = serviceName.toLowerCase().trim();
    const brand = BRAND_ICONS[normalizedName];
    return brand?.primaryColor || null;
  }

  /**
   * 获取品牌背景色
   */
  static getBrandBackgroundColor(serviceName: string, colorScheme: 'light' | 'dark' = 'light'): string | null {
    const normalizedName = serviceName.toLowerCase().trim();
    const brand = BRAND_ICONS[normalizedName];
    return brand?.backgroundColor[colorScheme] || null;
  }

  /**
   * 检查是否有品牌图标
   */
  static hasBrandIcon(serviceName: string): boolean {
    const normalizedName = serviceName.toLowerCase().trim();
    return !!BRAND_ICONS[normalizedName];
  }

  /**
   * 获取所有支持的品牌列表
   */
  static getSupportedBrands(): string[] {
    return Object.keys(BRAND_ICONS);
  }

  /**
   * 智能匹配服务名称
   * 支持模糊匹配，如 "Google Mail" 会匹配到 "google"
   */
  static matchServiceName(serviceName: string): string | null {
    const normalizedInput = serviceName.toLowerCase().trim();
    
    // 精确匹配
    if (BRAND_ICONS[normalizedInput]) {
      return normalizedInput;
    }

    // 模糊匹配
    const brands = Object.keys(BRAND_ICONS);
    
    // 检查是否包含品牌名称
    for (const brand of brands) {
      if (normalizedInput.includes(brand) || brand.includes(normalizedInput)) {
        return brand;
      }
    }

    // 特殊匹配规则
    const specialMatches: Record<string, string> = {
      'gmail': 'google',
      'google mail': 'google',
      'outlook': 'microsoft',
      'hotmail': 'microsoft',
      'live': 'microsoft',
      'xbox': 'microsoft',
      'skype': 'microsoft',
      'onedrive': 'microsoft',
      'office': 'microsoft',
      'teams': 'microsoft',
      'icloud': 'apple',
      'app store': 'apple',
      'itunes': 'apple',
      'twitch': 'amazon',
      'aws': 'amazon',
      'whatsapp': 'facebook',
      'instagram': 'facebook',
      'meta': 'facebook',
      'valve': 'steam',
    };

    for (const [key, value] of Object.entries(specialMatches)) {
      if (normalizedInput.includes(key)) {
        return value;
      }
    }

    return null;
  }
}