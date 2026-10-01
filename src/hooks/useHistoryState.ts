import { useState, useEffect, useCallback, useRef } from 'react';
import { SceneConfig, HistorySnapshot } from '../types';

const STORAGE_KEY = 'maket_generator_autosave_v2';
const MAX_HISTORY_STEPS = 40;

interface SavedStateWrapper {
  history: HistorySnapshot[];
  historyIndex: number;
}

export function useHistoryState(
  initialSceneConfig: SceneConfig,
  initialPhoneImage: string | null = null
) {
  // Load initial state from localStorage if available
  const [historyState, setHistoryState] = useState<SavedStateWrapper>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: SavedStateWrapper = JSON.parse(raw);
        if (
          parsed &&
          Array.isArray(parsed.history) &&
          parsed.history.length > 0 &&
          typeof parsed.historyIndex === 'number' &&
          parsed.historyIndex >= 0 &&
          parsed.historyIndex < parsed.history.length
        ) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Could not load auto-saved scene from localStorage:', err);
    }

    const firstSnapshot: HistorySnapshot = {
      sceneConfig: initialSceneConfig,
      phoneImage: initialPhoneImage,
      timestamp: Date.now(),
      description: 'Початковий стан',
    };

    return {
      history: [firstSnapshot],
      historyIndex: 0,
    };
  });

  const { history, historyIndex } = historyState;
  const currentSnapshot = history[historyIndex] || {
    sceneConfig: initialSceneConfig,
    phoneImage: initialPhoneImage,
  };

  // Live state that can update at 60fps during dragging
  const [sceneConfig, setSceneConfigState] = useState<SceneConfig>(currentSnapshot.sceneConfig);
  const [phoneImage, setPhoneImageState] = useState<string | null>(currentSnapshot.phoneImage);
  const [lastSaved, setLastSaved] = useState<number>(Date.now());
  const [isRestoredFromSave, setIsRestoredFromSave] = useState<boolean>(false);

  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isNavigatingHistoryRef = useRef<boolean>(false);

  // Sync live state when historyIndex changes (e.g. on Undo or Redo)
  useEffect(() => {
    if (history[historyIndex]) {
      setSceneConfigState(history[historyIndex].sceneConfig);
      setPhoneImageState(history[historyIndex].phoneImage);
    }
  }, [historyIndex, history]);

  // Check if we loaded from existing autosave
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setIsRestoredFromSave(true);
      }
    } catch {
      // ignore
    }
  }, []);

  // Helper to safely persist to localStorage with quota fallback
  const persistToStorage = useCallback((h: HistorySnapshot[], idx: number) => {
    try {
      const dataToSave: SavedStateWrapper = {
        history: h,
        historyIndex: idx,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setLastSaved(Date.now());
    } catch (err) {
      console.warn('localStorage quota exceeded, trimming history for autosave:', err);
      try {
        // Fallback: prune older history or save only the current state
        const prunedHistory = h.slice(Math.max(0, idx - 5), idx + 1);
        const dataToSave: SavedStateWrapper = {
          history: prunedHistory,
          historyIndex: prunedHistory.length - 1,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
        setLastSaved(Date.now());
      } catch (innerErr) {
        console.error('Failed to autosave to localStorage:', innerErr);
      }
    }
  }, []);

  // Commit a discrete change into history stack
  const commitSnapshot = useCallback(
    (
      newConfig: SceneConfig,
      newPhoneImg: string | null = phoneImage,
      description?: string
    ) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      setHistoryState((prev) => {
        // Discard any redo branch after current index
        const validHistory = prev.history.slice(0, prev.historyIndex + 1);

        const newSnapshot: HistorySnapshot = {
          sceneConfig: newConfig,
          phoneImage: newPhoneImg,
          timestamp: Date.now(),
          description: description || 'Зміна налаштувань',
        };

        let updatedHistory = [...validHistory, newSnapshot];
        let newIndex = updatedHistory.length - 1;

        // Cap max history steps to prevent runaway memory usage
        if (updatedHistory.length > MAX_HISTORY_STEPS) {
          const dropCount = updatedHistory.length - MAX_HISTORY_STEPS;
          updatedHistory = updatedHistory.slice(dropCount);
          newIndex = updatedHistory.length - 1;
        }

        persistToStorage(updatedHistory, newIndex);

        return {
          history: updatedHistory,
          historyIndex: newIndex,
        };
      });

      setSceneConfigState(newConfig);
      setPhoneImageState(newPhoneImg);
    },
    [phoneImage, persistToStorage]
  );

  // Debounce-commit live changes from sliders/inputs when inactive for 700ms
  useEffect(() => {
    if (isNavigatingHistoryRef.current) {
      isNavigatingHistoryRef.current = false;
      return;
    }

    const currentSnap = history[historyIndex];
    if (!currentSnap) return;

    if (sceneConfig === currentSnap.sceneConfig && phoneImage === currentSnap.phoneImage) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      commitSnapshot(sceneConfig, phoneImage, 'Зміна параметрів');
    }, 700);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [sceneConfig, phoneImage, history, historyIndex, commitSnapshot]);

  // Live updater for smooth 60fps drags/sliders (does NOT push a snapshot on every pixel move)
  const updateLiveConfig = useCallback(
    (updater: SceneConfig | ((prev: SceneConfig) => SceneConfig)) => {
      setSceneConfigState((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        return next;
      });
    },
    []
  );

  // Live phone image updater
  const updateLivePhoneImage = useCallback(
    (img: string | null) => {
      setPhoneImageState(img);
      commitSnapshot(sceneConfig, img, 'Зміна фотографії телефону');
    },
    [sceneConfig, commitSnapshot]
  );

  // Undo
  const undo = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    isNavigatingHistoryRef.current = true;
    setHistoryState((prev) => {
      if (prev.historyIndex <= 0) return prev;
      const newIdx = prev.historyIndex - 1;
      persistToStorage(prev.history, newIdx);
      return {
        ...prev,
        historyIndex: newIdx,
      };
    });
  }, [persistToStorage]);

  // Redo
  const redo = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    isNavigatingHistoryRef.current = true;
    setHistoryState((prev) => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      const newIdx = prev.historyIndex + 1;
      persistToStorage(prev.history, newIdx);
      return {
        ...prev,
        historyIndex: newIdx,
      };
    });
  }, [persistToStorage]);

  // Reset to initial scene
  const resetToInitial = useCallback(
    (initialConfig: SceneConfig, initialPhone: string | null = null) => {
      const resetSnapshot: HistorySnapshot = {
        sceneConfig: initialConfig,
        phoneImage: initialPhone,
        timestamp: Date.now(),
        description: 'Скидання до початкового стану',
      };
      const newHistory = [resetSnapshot];
      setHistoryState({
        history: newHistory,
        historyIndex: 0,
      });
      setSceneConfigState(initialConfig);
      setPhoneImageState(initialPhone);
      persistToStorage(newHistory, 0);
    },
    [persistToStorage]
  );

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return {
    sceneConfig,
    setSceneConfig: updateLiveConfig,
    commitSnapshot,
    phoneImage,
    setPhoneImage: updateLivePhoneImage,
    undo,
    redo,
    canUndo,
    canRedo,
    historyIndex,
    historyTotal: history.length,
    lastSaved,
    isRestoredFromSave,
    resetToInitial,
  };
}
