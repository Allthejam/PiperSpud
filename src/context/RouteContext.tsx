"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { RouteAssessment, GisToolMode, HazardObservation, RouteStop, StopType } from '@/types/route';
import { getAllRoutes, saveRoute, deleteRoute as deleteRouteApi, resetMockData as resetMockDataApi } from '@/lib/firestore';
import { calculateTotalRouteDistanceKm, calculateEstimatedRunningTime } from '@/lib/calculations';

export type ActiveTab = 'map' | 'hazards' | 'fleet' | 'driver' | 'governance';

export interface ConfirmModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}

interface RouteContextType {
  routes: RouteAssessment[];
  currentRouteId: string;
  currentRoute: RouteAssessment | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  gisToolMode: GisToolMode;
  setGisToolMode: (mode: GisToolMode) => void;
  selectRoute: (id: string) => void;
  updateCurrentRoute: (updater: (prev: RouteAssessment) => RouteAssessment) => void;
  saveCurrentRoute: () => Promise<void>;
  createNewRoute: (routeNumber: string, routeTitle: string, depot: string) => void;
  deleteCurrentRoute: () => Promise<void>;
  resetToMockData: () => void;
  
  // Pending placement coordinates for modals
  pendingCoords: [number, number] | null;
  setPendingCoords: (coords: [number, number] | null) => void;
  pendingStopType: StopType | null;
  setPendingStopType: (type: StopType | null) => void;
  
  // Modals
  isAddStopModalOpen: boolean;
  setIsAddStopModalOpen: (open: boolean) => void;
  isAddHazardModalOpen: boolean;
  setIsAddHazardModalOpen: (open: boolean) => void;
  selectedHazardForModal: HazardObservation | null;
  setSelectedHazardForModal: (hazard: HazardObservation | null) => void;
  confirmModal: ConfirmModalState;
  showConfirmModal: (config: Omit<ConfirmModalState, 'isOpen'>) => void;
  hideConfirmModal: () => void;
  
  // GPS & Field State
  isGpsTracking: boolean;
  setIsGpsTracking: (tracking: boolean) => void;
  userGpsPosition: [number, number] | null;
  setUserGpsPosition: (pos: [number, number] | null) => void;
  gpsAccuracyMeters: number | null;
  setUserGpsAccuracy: (acc: number | null) => void;
  
  // Map View
  tileLayer: 'osm' | 'satellite';
  setTileLayer: (layer: 'osm' | 'satellite') => void;
  
  // Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
  
  // Path manipulation helpers
  addPathPoint: (coord: [number, number]) => void;
  undoPathPoint: () => void;
  reversePath: () => void;
  clearPath: () => void;
  startOver: () => void;
}

const RouteContext = createContext<RouteContextType | undefined>(undefined);

export function RouteProvider({ children }: { children: ReactNode }) {
  const [routes, setRoutes] = useState<RouteAssessment[]>([]);
  const [currentRouteId, setCurrentRouteId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<ActiveTab>('map');
  const [gisToolMode, setGisToolMode] = useState<GisToolMode>('browse');
  const [tileLayer, setTileLayer] = useState<'osm' | 'satellite'>('osm');
  
  const [pendingCoords, setPendingCoords] = useState<[number, number] | null>(null);
  const [pendingStopType, setPendingStopType] = useState<StopType | null>(null);
  const [isAddStopModalOpen, setIsAddStopModalOpen] = useState(false);
  const [isAddHazardModalOpen, setIsAddHazardModalOpen] = useState(false);
  const [selectedHazardForModal, setSelectedHazardForModal] = useState<HazardObservation | null>(null);
  
  const [isGpsTracking, setIsGpsTracking] = useState(false);
  const [userGpsPosition, setUserGpsPosition] = useState<[number, number] | null>(null);
  const [gpsAccuracyMeters, setUserGpsAccuracy] = useState<number | null>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    isDestructive: false,
    onConfirm: () => {},
  });

  // Initial load
  useEffect(() => {
    async function load() {
      const data = await getAllRoutes();
      setRoutes(data);
      if (data.length > 0) {
        setCurrentRouteId(data[0].id);
      }
    }
    load();
  }, []);

  const currentRoute = routes.find((r) => r.id === currentRouteId) || (routes.length > 0 ? routes[0] : null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const showConfirmModal = (config: Omit<ConfirmModalState, 'isOpen'>) => {
    setConfirmModal({
      isOpen: true,
      ...config,
    });
  };

  const hideConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const selectRoute = (id: string) => {
    setCurrentRouteId(id);
    showToast(`Switched to Route ${routes.find((r) => r.id === id)?.routeNumber || id}`);
  };

  const updateCurrentRoute = (updater: (prev: RouteAssessment) => RouteAssessment) => {
    if (!currentRoute) return;
    const updated = updater(currentRoute);
    
    // Auto-recalculate distance and running time if path or stops changed
    const distanceKm = calculateTotalRouteDistanceKm(updated.pathCoordinates);
    const estTime = calculateEstimatedRunningTime(distanceKm, updated.stops, updated.averageSpeedKph || 22);
    
    const finalized: RouteAssessment = {
      ...updated,
      totalDistanceKm: distanceKm,
      estimatedRunningTimeMin: estTime,
      updatedAt: new Date().toISOString(),
    };

    setRoutes((prev) => prev.map((r) => (r.id === finalized.id ? finalized : r)));
    saveRoute(finalized);
  };

  const saveCurrentRoute = async () => {
    if (currentRoute) {
      await saveRoute(currentRoute);
      showToast(`Route ${currentRoute.routeNumber} saved successfully.`);
    }
  };

  const createNewRoute = (routeNumber: string, routeTitle: string, depot: string) => {
    const newRoute: RouteAssessment = {
      id: `SC-RRA-${Date.now().toString(36).toUpperCase()}`,
      routeNumber: routeNumber || 'New Route',
      routeTitle: routeTitle || 'New Survey Route',
      depot: depot || 'Depot',
      operatingCompany: 'Stagecoach',
      assessorName: 'Field Assessor',
      assessmentDate: new Date().toISOString().split('T')[0],
      reviewDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
      status: 'Draft',
      pathCoordinates: [],
      totalDistanceKm: 0,
      estimatedRunningTimeMin: 0,
      averageSpeedKph: 22,
      stops: [],
      hazards: [],
      vehicleRestrictions: {
        maxVehicleHeightM: 4.4,
        doubleDeckerAllowed: true,
        coachAllowed: true,
        evAllowed: true,
        notes: 'Initial survey clearance pending'
      },
      governance: {
        assessorName: 'Field Assessor',
        assessorRole: 'Route Risk Assessor',
        managerName: 'Operations Safety Manager',
        managerRole: 'Head of Operations',
        status: 'DRAFT'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setRoutes((prev) => [newRoute, ...prev]);
    setCurrentRouteId(newRoute.id);
    saveRoute(newRoute);
    showToast(`Created new Route ${newRoute.routeNumber}`);
  };

  const deleteCurrentRoute = async () => {
    if (!currentRoute) return;
    const toDeleteId = currentRoute.id;
    await deleteRouteApi(toDeleteId);
    setRoutes((prev) => {
      const remaining = prev.filter((r) => r.id !== toDeleteId);
      if (remaining.length > 0) {
        setCurrentRouteId(remaining[0].id);
      }
      return remaining;
    });
    showToast('Route deleted');
  };

  const resetToMockData = () => {
    const data = resetMockDataApi();
    setRoutes(data);
    if (data.length > 0) {
      setCurrentRouteId(data[0].id);
    }
    showToast('Reset to corporate Stagecoach mock routes');
  };

  // GIS Path Operations
  const addPathPoint = (coord: [number, number]) => {
    updateCurrentRoute((prev) => ({
      ...prev,
      pathCoordinates: [...prev.pathCoordinates, coord],
    }));
  };

  const undoPathPoint = () => {
    if (!currentRoute || currentRoute.pathCoordinates.length === 0) return;
    updateCurrentRoute((prev) => ({
      ...prev,
      pathCoordinates: prev.pathCoordinates.slice(0, -1),
    }));
    showToast('Removed last path coordinate');
  };

  const reversePath = () => {
    if (!currentRoute || currentRoute.pathCoordinates.length === 0) return;
    updateCurrentRoute((prev) => ({
      ...prev,
      pathCoordinates: [...prev.pathCoordinates].reverse(),
    }));
    showToast('Route path reversed');
  };

  const clearPath = () => {
    showConfirmModal({
      title: 'Clear Route Path?',
      message: 'This will erase all drawn GPS path coordinates for this route. Stops and Hazards will remain intact.',
      confirmText: 'Clear Path',
      isDestructive: true,
      onConfirm: () => {
        updateCurrentRoute((prev) => ({
          ...prev,
          pathCoordinates: [],
        }));
        showToast('Route path cleared');
      },
    });
  };

  const startOver = () => {
    showConfirmModal({
      title: 'Start Over Route Assessment?',
      message: 'This will reset all drawn path coordinates, stops, and hazards on this route to blank. This action cannot be undone.',
      confirmText: 'Start Over',
      isDestructive: true,
      onConfirm: () => {
        updateCurrentRoute((prev) => ({
          ...prev,
          pathCoordinates: [],
          stops: [],
          hazards: [],
          totalDistanceKm: 0,
          estimatedRunningTimeMin: 0,
        }));
        showToast('Route reset to blank state');
      },
    });
  };

  return (
    <RouteContext.Provider
      value={{
        routes,
        currentRouteId,
        currentRoute,
        activeTab,
        setActiveTab,
        gisToolMode,
        setGisToolMode,
        selectRoute,
        updateCurrentRoute,
        saveCurrentRoute,
        createNewRoute,
        deleteCurrentRoute,
        resetToMockData,
        pendingCoords,
        setPendingCoords,
        pendingStopType,
        setPendingStopType,
        isAddStopModalOpen,
        setIsAddStopModalOpen,
        isAddHazardModalOpen,
        setIsAddHazardModalOpen,
        selectedHazardForModal,
        setSelectedHazardForModal,
        confirmModal,
        showConfirmModal,
        hideConfirmModal,
        isGpsTracking,
        setIsGpsTracking,
        userGpsPosition,
        setUserGpsPosition,
        gpsAccuracyMeters,
        setUserGpsAccuracy,
        tileLayer,
        setTileLayer,
        toastMessage,
        showToast,
        addPathPoint,
        undoPathPoint,
        reversePath,
        clearPath,
        startOver,
      }}
    >
      {children}
    </RouteContext.Provider>
  );
}

export function useRouteContext() {
  const ctx = useContext(RouteContext);
  if (!ctx) {
    throw new Error('useRouteContext must be used within a RouteProvider');
  }
  return ctx;
}
