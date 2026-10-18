import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

export const defaultResources = {
  en: {
    translation: {
      appName: 'Kirana Ledger',
      nav: {
        add: 'Add',
        sales: 'Sales',
        stock: 'Stock',
        report: 'Report',
      },
      dashboard: {
        sales: 'Sales',
        netProfit: 'Net Profit',
        expenses: 'Expenses',
        avgDay: 'Avg / Day',
        dailySales: 'Daily sales',
        salesHistory: 'Sales history',
        noDataMonth: 'No data this month',
        salesRecordNote: 'Sales you record will show up here.',
        totalStockCost: 'Total stock cost',
        totalSaleTillNow: 'Total sale till now',
      },
      sync: {
        allSaved: 'All saved',
        syncing: 'Syncing...',
        waiting: '{{count}} waiting to sync',
        needsAttention: 'Needs attention',
        offline: 'Offline',
        serverConnected: 'Server Connected',
        serverDisconnected: 'Server Offline',
      },
      common: {
        save: 'Save',
        sold: 'SOLD',
        addSize: '+ Add Size',
        addCustomer: '+ Add customer name',
        searchPlaceholder: 'Search by name or ID...',
        inStock: 'IN STOCK',
        cost: 'Cost',
        sell: 'Sell',
      },
    },
  },
  hi: {
    translation: {
      appName: 'किराना लेजर',
      nav: {
        add: 'जोड़ें',
        sales: 'बिक्री',
        stock: 'स्टॉक',
        report: 'रिपोर्ट',
      },
      dashboard: {
        sales: 'बिक्री',
        netProfit: 'शुद्ध लाभ',
        expenses: 'खर्चे',
        avgDay: 'औसत / दिन',
        dailySales: 'दैनिक बिक्री',
        salesHistory: 'बिक्री इतिहास',
        noDataMonth: 'इस महीने कोई डेटा नहीं',
        salesRecordNote: 'आपके द्वारा दर्ज की गई बिक्री यहां दिखाई देगी।',
        totalStockCost: 'कुल स्टॉक लागत',
        totalSaleTillNow: 'अब तक कुल बिक्री',
      },
      sync: {
        allSaved: 'सभी सुरक्षित',
        syncing: 'सिंक हो रहा है...',
        waiting: '{{count}} सिंक बाकी',
        needsAttention: 'ध्यान दें',
        offline: 'ऑफ़लाइन',
        serverConnected: 'सर्वर जुड़ा हुआ है',
        serverDisconnected: 'सर्वर डिस्कनेक्ट है',
      },
      common: {
        save: 'सुरक्षित करें',
        sold: 'बेचा',
        addSize: '+ आकार जोड़ें',
        addCustomer: '+ ग्राहक का नाम जोड़ें',
        searchPlaceholder: 'नाम या आईडी से खोजें...',
        inStock: 'स्टॉक में',
        cost: 'लागत',
        sell: 'बिक्री मूल्य',
      },
    },
  },
  kn: {
    translation: {
      appName: 'ಕಿರಾಣಿ ಲೆಡ್ಜರ್',
      nav: {
        add: 'ಸೇರಿಸಿ',
        sales: 'ಮಾರಾಟ',
        stock: 'ದಾಸ್ತಾನು',
        report: 'ವರದಿ',
      },
      dashboard: {
        sales: 'ಮಾರಾಟ',
        netProfit: 'ನಿವ್ವಳ ಲಾಭ',
        expenses: 'ವೆಚ್ಚಗಳು',
        avgDay: 'ದೈನಂದಿನ ಸರಾಸರಿ',
        dailySales: 'ದೈನಂದಿನ ಮಾರಾಟ',
        salesHistory: 'ಮಾರಾಟ ಇತಿಹಾಸ',
        noDataMonth: 'ಈ ತಿಂಗಳು ಯಾವುದೇ ಮಾಹಿತಿ ಇಲ್ಲ',
        salesRecordNote: 'ನೀವು ನಮೂದಿಸಿದ ಮಾರಾಟಗಳು ಇಲ್ಲಿ ಕಾಣಿಸುತ್ತವೆ.',
        totalStockCost: 'ಒಟ್ಟು ದಾಸ್ತಾನು ವೆಚ್ಚ',
        totalSaleTillNow: 'ಇಲ್ಲಿಯವರೆಗಿನ ಒಟ್ಟು ಮಾರಾಟ',
      },
      sync: {
        allSaved: 'ಎಲ್ಲವೂ ಉಳಿಸಲಾಗಿದೆ',
        syncing: 'ಸಿಂಕ್ ಆಗುತ್ತಿದೆ...',
        waiting: '{{count}} ಸಿಂಕ್ ಬಾಕಿ',
        needsAttention: 'ಗಮನಿಸಿ',
        offline: 'ಆಫ್‌ಲೈನ್',
        serverConnected: 'ಸರ್ವರ್ ಸಂಪರ್ಕಗೊಂಡಿದೆ',
        serverDisconnected: 'ಸರ್ವರ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಂಡಿದೆ',
      },
      common: {
        save: 'ಉಳಿಸಿ',
        sold: 'ಮಾರಾಟವಾಯಿತು',
        addSize: '+ ಗಾತ್ರ ಸೇರಿಸಿ',
        addCustomer: '+ ಗ್ರಾಹಕರ ಹೆಸರು ಸೇರಿಸಿ',
        searchPlaceholder: 'ಹೆಸರು ಅಥವಾ ಐಡಿಯಿಂದ ಹುಡುಕಿ...',
        inStock: 'ದಾಸ್ತಾನಿನಲ್ಲಿದೆ',
        cost: 'ವೆಚ್ಚ',
        sell: 'ಮಾರಾಟ ಬೆಲೆ',
      },
    },
  },
};

export function initI18n(initialLanguage = 'en') {
  if (!i18next.isInitialized) {
    i18next.use(initReactI18next).init({
      resources: defaultResources,
      lng: initialLanguage,
      fallbackLng: 'en',
      interpolation: {
        escapeValue: false,
      },
    });
  }
  return i18next;
}

export default i18next;
