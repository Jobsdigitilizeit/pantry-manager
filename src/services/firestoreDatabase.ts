import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { PantryItem, Recipe, AppSettings } from '../types';
import { SEEDED_RECIPES } from '../data/seedRecipes';
import { INITIAL_PANTRY_ITEMS } from '../data/initialPantry';
import { DEFAULT_SETTINGS } from '../utils/database';

export class FirestorePantryService {
  private static instance: FirestorePantryService;
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): FirestorePantryService {
    if (!FirestorePantryService.instance) {
      FirestorePantryService.instance = new FirestorePantryService();
    }
    return FirestorePantryService.instance;
  }

  /**
   * Initializes the Firestore database with recipes and initial pantry items if empty.
   */
  public async initializeDatabase(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // 1. Seed recipes if collection is empty
      const recipesRef = collection(db, 'recipes');
      const recipesSnapshot = await getDocs(recipesRef).catch((err) => {
        handleFirestoreError(err, OperationType.GET, 'recipes');
      });

      if (recipesSnapshot.empty) {
        console.log('Seeding recipes into Firebase Firestore...');
        const batch = writeBatch(db);
        for (const recipe of SEEDED_RECIPES) {
          const recipeDocRef = doc(db, 'recipes', recipe.id);
          batch.set(recipeDocRef, recipe);
        }
        await batch.commit().catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, 'recipes');
        });
        console.log('Successfully seeded 22 recipes into Firebase Firestore!');
      }

      // 2. Seed pantry items if collection is empty
      const pantryRef = collection(db, 'pantry_items');
      const pantrySnapshot = await getDocs(pantryRef).catch((err) => {
        handleFirestoreError(err, OperationType.GET, 'pantry_items');
      });

      if (pantrySnapshot.empty) {
        console.log('Seeding initial pantry items into Firebase Firestore...');
        const batch = writeBatch(db);
        for (const item of INITIAL_PANTRY_ITEMS) {
          const itemDocRef = doc(db, 'pantry_items', item.id);
          batch.set(itemDocRef, item);
        }
        await batch.commit().catch((err) => {
          handleFirestoreError(err, OperationType.WRITE, 'pantry_items');
        });
        console.log('Successfully seeded initial pantry items into Firebase Firestore!');
      }

      // 3. Seed default settings if not exists
      const settingsDocRef = doc(db, 'settings', 'app_config');
      await setDoc(settingsDocRef, DEFAULT_SETTINGS, { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, 'settings/app_config');
      });

      this.isInitialized = true;
    } catch (err) {
      console.error('Error during Firestore database initialization:', err);
    }
  }

  // --- REAL-TIME LISTENERS ---

  public subscribeToPantry(callback: (items: PantryItem[]) => void): () => void {
    const pantryRef = collection(db, 'pantry_items');
    return onSnapshot(
      pantryRef,
      (snapshot) => {
        const items: PantryItem[] = [];
        snapshot.forEach((d) => {
          items.push({ ...(d.data() as PantryItem), id: d.id });
        });
        callback(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'pantry_items');
      }
    );
  }

  public subscribeToRecipes(callback: (recipes: Recipe[]) => void): () => void {
    const recipesRef = collection(db, 'recipes');
    return onSnapshot(
      recipesRef,
      (snapshot) => {
        const recipes: Recipe[] = [];
        snapshot.forEach((d) => {
          recipes.push({ ...(d.data() as Recipe), id: d.id });
        });
        callback(recipes.length > 0 ? recipes : SEEDED_RECIPES);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'recipes');
      }
    );
  }

  public subscribeToSettings(callback: (settings: AppSettings) => void): () => void {
    const settingsDocRef = doc(db, 'settings', 'app_config');
    return onSnapshot(
      settingsDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.data() as AppSettings);
        } else {
          callback(DEFAULT_SETTINGS);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'settings/app_config');
      }
    );
  }

  // --- CRUD: CREATE ---
  public async insertPantryItem(
    itemData: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PantryItem> {
    const newId = `pnt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const newItem: PantryItem = {
      ...itemData,
      id: newId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const docRef = doc(db, 'pantry_items', newId);
    await setDoc(docRef, newItem).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `pantry_items/${newId}`);
    });

    return newItem;
  }

  // --- CRUD: UPDATE ---
  public async updatePantryItem(item: PantryItem): Promise<void> {
    const docRef = doc(db, 'pantry_items', item.id);
    const updatedData = {
      ...item,
      updatedAt: Date.now(),
    };

    await updateDoc(docRef, updatedData).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `pantry_items/${item.id}`);
    });
  }

  // --- CRUD: DELETE ---
  public async deletePantryItem(id: string): Promise<void> {
    const docRef = doc(db, 'pantry_items', id);
    await deleteDoc(docRef).catch((err) => {
      handleFirestoreError(err, OperationType.DELETE, `pantry_items/${id}`);
    });
  }

  // --- BATCH DEDUCTION ON COOK ---
  public async deductRecipeIngredients(
    recipe: Recipe,
    currentPantry: PantryItem[],
    servingsRatio = 1.0
  ): Promise<boolean> {
    try {
      const batch = writeBatch(db);

      for (const req of recipe.ingredients) {
        const reqAmount = req.quantity * servingsRatio;
        const target = currentPantry.find(
          (p) =>
            p.name.toLowerCase().includes(req.name.toLowerCase()) ||
            req.name.toLowerCase().includes(p.name.toLowerCase())
        );

        if (target) {
          const newQty = Math.max(0, Number((target.quantity - reqAmount).toFixed(2)));
          const docRef = doc(db, 'pantry_items', target.id);
          batch.update(docRef, { quantity: newQty, updatedAt: Date.now() });
        }
      }

      await batch.commit().catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, 'pantry_items');
      });

      return true;
    } catch (err) {
      console.error('Failed to deduct ingredients in Firestore:', err);
      return false;
    }
  }

  // --- RESET & CLEAR ---
  public async resetToSampleData(): Promise<void> {
    try {
      // 1. Clear existing pantry docs
      const pantryRef = collection(db, 'pantry_items');
      const snapshot = await getDocs(pantryRef).catch((err) => {
        handleFirestoreError(err, OperationType.GET, 'pantry_items');
      });

      const batch = writeBatch(db);
      snapshot.forEach((d) => {
        batch.delete(d.ref);
      });

      // 2. Re-insert initial pantry items
      for (const item of INITIAL_PANTRY_ITEMS) {
        const docRef = doc(db, 'pantry_items', item.id);
        batch.set(docRef, item);
      }

      await batch.commit().catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, 'pantry_items');
      });
    } catch (err) {
      console.error('Failed to reset sample data in Firestore:', err);
    }
  }

  public async clearAllPantryItems(): Promise<void> {
    try {
      const pantryRef = collection(db, 'pantry_items');
      const snapshot = await getDocs(pantryRef).catch((err) => {
        handleFirestoreError(err, OperationType.GET, 'pantry_items');
      });

      const batch = writeBatch(db);
      snapshot.forEach((d) => {
        batch.delete(d.ref);
      });

      await batch.commit().catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, 'pantry_items');
      });
    } catch (err) {
      console.error('Failed to clear pantry items in Firestore:', err);
    }
  }

  public async updateSettings(settings: Partial<AppSettings>): Promise<void> {
    const docRef = doc(db, 'settings', 'app_config');
    await setDoc(docRef, settings, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, 'settings/app_config');
    });
  }
}
