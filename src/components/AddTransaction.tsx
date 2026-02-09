'use client'

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useFinanceStore } from '@/store/useStore';
import { Plus, X, ArrowRight, Trash2, Edit2, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppModal from '@/components/AppModal';
import { Category } from '@/types';
import { translations } from '@/lib/translations';

const EMOJIS = [
  '💰','🛒','🚗','🏠','🍔','🍕','🍺','☕️','💊','🎁','🎮','🎬','👟','👕','📱','💻',
  '🏋️‍♂️','💅','📚','✈️','🎉','🐈','🌿','🥨','🍦','🛠','🎨','🎸','🎟','🥎','🔋','🧺',
  '🥗','🥐','🚲','🚌','🚇','🎭','💈','🛀','🧼','🧹','🕯','📫','📦','💎','🍣','🍹'
];

export default function AddTransaction() {
  const { addTransaction, setCategories: setGlobalCategories, lang, currency, rate } = useFinanceStore();
  const t = translations[lang as keyof typeof translations];

  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [localCats, setLocalCats] = useState<Category[]>([]);

  const [isEditing, setIsEditing] = useState<Category | 'new' | null>(null);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('📦');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [deleteCatModal, setDeleteCatModal] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  // Ref для автоматической прокрутки инпута в видимую область
  const amountInputRef = useRef<HTMLInputElement>(null);

  // 🔑 получаем user_id (ОБЯЗАТЕЛЬНО для RLS)
  const getUserId = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id;
  };

  const fetchCats = async () => {
    const userId = await getUserId();
    if (!userId) return;
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type);

    if (data) setLocalCats(data as Category[]);
  };

  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      const userId = await getUserId();
      if (!userId) return;
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type);

      if (data) setLocalCats(data as Category[]);
    })();
  }, [isOpen, type]);

  // Автоматическая прокрутка и фокус на инпут при открытии step 1
  useEffect(() => {
    if (isOpen && step === 1 && amountInputRef.current) {
      setTimeout(() => {
        amountInputRef.current?.focus();
        amountInputRef.current?.scrollIntoView({ behavior: 'auto', block: 'center' });
      }, 200);
    }
  }, [isOpen, step]);

  // ➕ создать / ✏️ обновить категорию
  const handleSaveCat = async () => {
    if (!catName) return;

    const userId = await getUserId();
    if (!userId) return;

    const payload = {
      user_id: userId,
      name: catName,
      icon: catIcon,
      type
    };

    if (isEditing && isEditing !== 'new') {
      await supabase
        .from('categories')
        .update(payload)
        .eq('id', (isEditing as Category).id)
        .eq('user_id', userId);

      if ((isEditing as Category).name !== catName) {
        await supabase
          .from('transactions')
          .update({ category: catName })
          .eq('category', (isEditing as Category).name)
          .eq('user_id', userId);
      }
    } else {
      await supabase.from('categories').insert([payload]);
    }

    // Refresh local and global categories so the UI shows the newly created/updated category
    await fetchCats();
    const { data: allCats } = await supabase.from('categories').select('*').eq('user_id', userId);
    if (allCats) setGlobalCategories(allCats);

    setIsEditing(null);
    setCatName('');
    setCatIcon('📦');
    setShowEmojiPicker(false);
  };

  const doDeleteCategory = async () => {
    if (!deleteCatModal.id) return;
    const userId = await getUserId();
    if (!userId) return;

    await supabase
      .from('categories')
      .delete()
      .eq('id', deleteCatModal.id)
      .eq('user_id', userId);

    fetchCats();
    const { data: allCats } = await supabase.from('categories').select('*').eq('user_id', userId);
    if (allCats) setGlobalCategories(allCats);
    setDeleteCatModal({ open: false, id: null });
  };

  const openDeleteCategoryModal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteCatModal({ open: true, id });
  };

  // 💾 сохранить транзакцию
  const saveTransaction = async (category: Category) => {
    const userId = await getUserId();
    if (!userId) return;

    const numAmount = parseFloat(amount);
    const finalAmount = currency === 'USD' ? numAmount * rate : numAmount;

    const newTx = {
      user_id: userId,
      amount: finalAmount,
      type,
      category: category.name
    };

    const { data, error } = await supabase
      .from('transactions')
      .insert([newTx])
      .select();

    if (!error && data) {
      addTransaction(data[0]);
      resetAll();
    }
  };

  const resetAll = () => {
    setIsOpen(false);
    setStep(1);
    setAmount('');
    setIsEditing(null);
    setShowEmojiPicker(false);
  };

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-6 w-16 h-16 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <Plus size={32} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetAll}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} 
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-xl max-h-screen overflow-y-auto bg-white dark:bg-zinc-900 rounded-t-[40px] p-8 pb-96 shadow-2xl min-h-[550px]"
            >
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{t.howMuch}</h2>
                    <button onClick={resetAll} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-slate-900 dark:text-white"><X size={20}/></button>
                  </div>

                  <div className="flex bg-gray-100 dark:bg-zinc-800 p-1.5 rounded-2xl mb-8">
                    {(['expense', 'income'] as const).map(itemType => (
                      <button 
                        key={itemType} onClick={() => setType(itemType)} 
                        className={`flex-1 py-3 rounded-xl font-bold transition-all ${type === itemType ? 'bg-white dark:bg-zinc-700 shadow-md text-blue-600 dark:text-blue-400' : 'opacity-40 text-gray-500 dark:text-zinc-500'}`}
                      >
                        {itemType === 'expense' ? t.expense : t.income}
                      </button>
                    ))}
                  </div>

                  <div className="relative mb-12">
                    {/* ИСПРАВЛЕННЫЙ ИНПУТ */}
                    <input 
                      ref={amountInputRef}
                      autoFocus type="number" step="0.01" inputMode="decimal"
                      value={amount} onChange={e => setAmount(e.target.value)} 
                      placeholder="0.00" 
                      className="w-full text-7xl font-black text-center bg-transparent outline-none text-zinc-900 dark:text-white 
                        [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                    />
                    <p className="text-center text-zinc-400 font-bold mt-2">
                        {currency === 'RUB' ? t.RUB : t.USD}
                    </p>
                  </div>

                  <button 
                    onClick={() => setStep(2)} disabled={!amount} 
                    className="w-full py-5 bg-blue-600 text-white rounded-[24px] font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-30 transition-all shadow-lg active:scale-95"
                  >
                    {t.next} <ArrowRight size={20}/>
                  </button>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="flex items-center gap-4 mb-8">
                    <button onClick={() => setStep(1)} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded-full"><ChevronLeft/></button>
                    <h2 className="text-xl font-bold">{t.choose}</h2>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-8 max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
                    {localCats.map(c => (
                      <div key={c.id} className="relative group overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-800">
                        <button onClick={() => saveTransaction(c)} className="w-full p-5 flex flex-col items-start bg-zinc-50 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all active:scale-95 text-left">
                          <span className="text-3xl mb-2">{c.icon || '📦'}</span>
                          <span className="text-[11px] font-black uppercase tracking-widest opacity-60 text-slate-900 dark:text-white">{c.name}</span>
                        </button>
                        <div className="absolute right-2 top-2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); setIsEditing(c); setCatName(c.name); setCatIcon(c.icon || '📦'); }} className="p-2 bg-zinc-50 dark:bg-zinc-700 shadow-md rounded-lg text-blue-500"><Edit2 size={14}/></button>
                          <button onClick={(e) => openDeleteCategoryModal(c.id, e)} className="p-2 bg-zinc-50 dark:bg-zinc-700 shadow-md rounded-lg text-red-500"><Trash2 size={14}/></button>
                        </div>
                      </div>
                    ))}
                    <button onClick={() => setIsEditing('new')} className="p-5 border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-2xl flex flex-col items-center justify-center gap-1 text-gray-400 dark:text-zinc-500 hover:border-blue-400">
                      <Plus size={24}/><span className="text-[10px] font-bold uppercase">{t.create}</span>
                    </button>
                  </div>
                </motion.div>
              )}

              <AnimatePresence>
                {isEditing && (
                  <motion.div initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "100%", opacity: 0 }} className="absolute inset-0 bg-white dark:bg-zinc-900 z-[60] p-8 rounded-t-[40px] flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{isEditing === 'new' ? t.newCat : t.editCat}</h3>
                      <button onClick={() => setIsEditing(null)} className="p-2 bg-gray-100 dark:bg-zinc-800 rounded-full text-slate-900 dark:text-white"><X/></button>
                    </div>
                    
                    <div className="flex gap-4 mb-8 items-end">
                      <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="text-5xl p-5 bg-zinc-50 dark:bg-zinc-800 rounded-[30px] border-2 border-blue-500/20 shadow-inner">{catIcon}</button>
                      <div className="flex-1">
                        <p className="text-[10px] font-bold uppercase text-gray-500 dark:text-zinc-400 mb-2 ml-1">{t.name}</p>
                        <input autoFocus value={catName} onChange={e => setCatName(e.target.value)} placeholder={t.placeholder} className="w-full text-2xl font-bold bg-transparent border-b-2 border-gray-200 dark:border-zinc-800 outline-none focus:border-blue-500 transition-colors pb-2 text-slate-900 dark:text-white" />
                      </div>
                    </div>

                    {showEmojiPicker && (
                      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="grid grid-cols-6 gap-3 mb-8 max-h-[200px] overflow-y-auto p-4 bg-gray-100 dark:bg-zinc-800 rounded-[24px]">
                        {EMOJIS.map(emoji => (
                          <button key={emoji} onClick={() => { setCatIcon(emoji); setShowEmojiPicker(false); }} className="text-3xl hover:scale-125 transition-transform active:scale-90">{emoji}</button>
                        ))}
                      </motion.div>
                    )}

                    <div className="mt-auto">
                      <button onClick={handleSaveCat} className="w-full py-5 bg-blue-600 dark:bg-blue-600 text-white rounded-[24px] font-bold text-lg shadow-xl active:scale-95">
                        {isEditing === 'new' ? t.btnCreate : t.btnSave}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            </div>
          )}
        </AnimatePresence>
        <AppModal
          isOpen={deleteCatModal.open}
          onClose={() => setDeleteCatModal({ open: false, id: null })}
          title={t.confirmDelete}
          message={t.confirmDeleteMessage}
          variant="danger"
          primaryButton={{ text: t.btnDelete, onClick: doDeleteCategory }}
          secondaryButton={{ text: t.btnCancel, onClick: () => {} }}
        />
      </>
    );
  }