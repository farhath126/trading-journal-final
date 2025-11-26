import { db } from '../config/firebase';
import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
    getDoc
} from 'firebase/firestore';

export const getUserTrades = async (userId) => {
    try {
        const tradesRef = collection(db, 'users', userId, 'trades');
        const snapshot = await getDocs(tradesRef);
        return snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    } catch (error) {
        console.error('Error fetching trades:', error);
        return [];
    }
};

export const saveUserTrade = async (userId, trade) => {
    try {
        const tradeRef = doc(db, 'users', userId, 'trades', trade.id);
        await setDoc(tradeRef, trade);
    } catch (error) {
        console.error('Error saving trade:', error);
    }
};

export const deleteUserTrade = async (userId, tradeId) => {
    try {
        const tradeRef = doc(db, 'users', userId, 'trades', tradeId);
        await deleteDoc(tradeRef);
    } catch (error) {
        console.error('Error deleting trade:', error);
    }
};

export const getUserSettings = async (userId) => {
    try {
        const settingsRef = doc(db, 'users', userId, 'settings', 'general');
        const snapshot = await getDoc(settingsRef);
        if (snapshot.exists()) {
            return snapshot.data();
        }
        return null;
    } catch (error) {
        console.error('Error fetching settings:', error);
        return null;
    }
};

export const saveUserSettings = async (userId, settings) => {
    try {
        const settingsRef = doc(db, 'users', userId, 'settings', 'general');
        await setDoc(settingsRef, settings);
    } catch (error) {
        console.error('Error saving settings:', error);
    }
};

export const getUserStrategies = async (userId) => {
    try {
        const strategiesRef = doc(db, 'users', userId, 'settings', 'strategies');
        const snapshot = await getDoc(strategiesRef);
        if (snapshot.exists()) {
            return snapshot.data().list || [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching strategies:', error);
        return [];
    }
};

export const saveUserStrategies = async (userId, strategies) => {
    try {
        const strategiesRef = doc(db, 'users', userId, 'settings', 'strategies');
        await setDoc(strategiesRef, { list: strategies });
    } catch (error) {
        console.error('Error saving strategies:', error);
    }
};

// Batch save for migration
export const batchSaveTrades = async (userId, trades) => {
    // Note: Firestore batch limit is 500. For simplicity, we'll loop for now or use Promise.all
    // In a real app with thousands of trades, we'd chunk this.
    try {
        const promises = trades.map(trade => saveUserTrade(userId, trade));
        await Promise.all(promises);
    } catch (error) {
        console.error('Error batch saving trades:', error);
    }
};
