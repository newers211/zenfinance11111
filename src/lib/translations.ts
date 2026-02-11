export const translations = {
  ru: {
    // Главная страница
    greet: 'Привет',
    balance: 'Ваш баланс',
    income: 'Приход',
    expense: 'Расход',
    history: 'История',
    ops: 'операций',
    empty: 'История пуста 🏜',
    loading: 'Загрузка...',
    analytics: 'Аналитика',
    deleteConfirmTitle: 'Удалить операцию?',
    deleteConfirmMessage: 'Эта операция будет удалена из истории.',
    deleteBtn: 'Удалить',
    cancelBtn: 'Отмена',

    // Settings Modal
    settingsTitle: 'Настройки',
    themeLabel: 'Тема',
    themeLight: 'Светлая',
    themeLightDesc: 'С белым фоном',
    themeDark: 'Темная',
    themeDarkDesc: 'Премиум внешний вид',
    languageLabel: 'Язык',
    infoText: '✨ Все изменения сохраняются автоматически',

    // Filters
    all: 'Все',
    day: 'День',
    week: 'Неделя',
    month: 'Месяц',
    expenses: 'Расходы',
    incomes: 'Доходы',

    // AddTransaction
    howMuch: 'Сколько?',
    next: 'Далее',
    choose: 'Выберите категорию',
    create: 'Создать',
    newCat: 'Новая категория',
    editCat: 'Редактирование',
    name: 'Название',
    placeholder: 'Напр: Такси',
    btnCreate: 'Создать категорию',
    btnSave: 'Сохранить изменения',
    confirmDelete: 'Удалить категорию?',
    confirmDeleteMessage: 'Категория будет удалена. Транзакции с ней останутся.',
    btnDelete: 'Удалить',
    btnCancel: 'Отмена',
    RUB: 'Российский рубль (₽)',
    USD: 'Доллар США ($)',

    // Chart компонент
    total: 'Итого',
    hint: 'Нажмите снова, чтобы вернуть',
    shareLabel: 'От общей суммы',
    sumLabel: 'Сумма',
    detailsLabel: 'Детали',
    categoryLabel: 'Категория',
    itemsLabel: 'Позиции',

    // Другие компоненты
    logout: 'Выход',
    settings: 'Настройки',
    add: 'Добавить',
    edit: 'Редактировать',
    delete: 'Удалить',
    save: 'Сохранить',
    close: 'Закрыть',
  },
  en: {
    // Main page
    greet: 'Welcome',
    balance: 'Total Balance',
    income: 'Income',
    expense: 'Expense',
    history: 'History',
    ops: 'transactions',
    empty: 'No history yet 🏜',
    loading: 'Loading...',
    analytics: 'Analytics',
    deleteConfirmTitle: 'Delete transaction?',
    deleteConfirmMessage: 'It will be removed from your history.',
    deleteBtn: 'Delete',
    cancelBtn: 'Cancel',

    // Settings Modal
    settingsTitle: 'Settings',
    themeLabel: 'Theme',
    themeLight: 'Light',
    themeLightDesc: 'Bright appearance',
    themeDark: 'Dark',
    themeDarkDesc: 'Premium look',
    languageLabel: 'Language',
    infoText: '✨ All changes are saved automatically',

    // Filters
    all: 'All',
    day: 'Day',
    week: 'Week',
    month: 'Month',
    expenses: 'Expenses',
    incomes: 'Incomes',

    // AddTransaction
    howMuch: 'How much?',
    next: 'Next',
    choose: 'Choose category',
    create: 'Create',
    newCat: 'New category',
    editCat: 'Edit category',
    name: 'Name',
    placeholder: 'e.g. Taxi',
    btnCreate: 'Create category',
    btnSave: 'Save changes',
    confirmDelete: 'Delete category?',
    confirmDeleteMessage: 'Category will be removed. Transactions will keep their category name.',
    btnDelete: 'Delete',
    btnCancel: 'Cancel',
    RUB: 'Russian Ruble (₽)',
    USD: 'US Dollar ($)',

    // Chart компонент
    total: 'Total',
    hint: 'Click again to reset',
    shareLabel: 'Share of total',
    sumLabel: 'Amount',
    detailsLabel: 'Details',
    categoryLabel: 'Category',
    itemsLabel: 'Items',

    // Other components
    logout: 'Logout',
    settings: 'Settings',
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    close: 'Close',
  },
} as const;

/**
 * Определяет предпочтительный язык браузера
 * RU/UK/BY → 'ru', все остальные → 'en'
 */
export function detectBrowserLanguage(): 'ru' | 'en' {
  if (typeof window === 'undefined') return 'en';
  
  const browserLang = navigator.language?.split('-')[0].toLowerCase() || 'en';
  
  // Русский, украинский и белорусский → устанавливаем русский
  if (['ru', 'uk', 'be'].includes(browserLang)) {
    return 'ru';
  }
  
  return 'en';
}

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof translations.ru;
