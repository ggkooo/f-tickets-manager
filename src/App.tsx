import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import GetTicket from './screens/GetTicket';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Attendant from './screens/Attendent';
import Login from './screens/Login';
import Admin from './screens/Admin';
import Tv from './screens/TV';
import LocationRouteGuard from './locations/LocationRouteGuard';
import {
  DEFAULT_CRE_LOCATION,
  DEFAULT_UNILAB_LOCATION,
  buildLocationAdminPath,
  buildLocationAttendantPath,
  buildLocationHomePath,
  buildLocationLoginPath,
  buildLocationTvPath,
} from './locations';


function App() {
  useEffect(() => {
    const keepUserInApp = () => {
      window.history.pushState({ appLocked: true }, '', window.location.href);
    };

    const isEditableElement = (target: EventTarget | null) => {
      if (!(target instanceof HTMLElement)) {
        return false;
      }

      if (target.isContentEditable) {
        return true;
      }

      const tagName = target.tagName;
      return tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
    };

    keepUserInApp();

    const handlePopState = () => {
      keepUserInApp();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      const isAltLeft = event.altKey && event.key === 'ArrowLeft';
      const isBackspaceOutsideField = event.key === 'Backspace' && !isEditableElement(event.target);

      if (isAltLeft || isBackspaceOutsideField) {
        event.preventDefault();
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={buildLocationHomePath(DEFAULT_UNILAB_LOCATION)} replace />} />
        <Route path="/tv" element={<Navigate to={buildLocationTvPath(DEFAULT_UNILAB_LOCATION)} replace />} />
        <Route path="/login" element={<Navigate to={buildLocationLoginPath(DEFAULT_UNILAB_LOCATION)} replace />} />
        <Route path="/attendent" element={<Navigate to={buildLocationAttendantPath(DEFAULT_UNILAB_LOCATION)} replace />} />
        <Route path="/admin" element={<Navigate to={buildLocationAdminPath(DEFAULT_UNILAB_LOCATION)} replace />} />
        <Route path="/cre" element={<Navigate to={buildLocationHomePath(DEFAULT_CRE_LOCATION)} replace />} />
        <Route
          path="/unilab/:location"
          element={(
            <LocationRouteGuard>
              <GetTicket />
            </LocationRouteGuard>
          )}
        />
        <Route
          path="/unilab/:location/tv"
          element={(
            <LocationRouteGuard>
              <Tv />
            </LocationRouteGuard>
          )}
        />
        <Route
          path="/unilab/:location/login"
          element={(
            <LocationRouteGuard>
              <Login />
            </LocationRouteGuard>
          )}
        />
        <Route
          path="/unilab/:location/attendent"
          element={(
            <LocationRouteGuard>
              <ProtectedRoute>
                <Attendant />
              </ProtectedRoute>
            </LocationRouteGuard>
          )}
        />
        <Route
          path="/unilab/:location/admin"
          element={(
            <LocationRouteGuard>
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            </LocationRouteGuard>
          )}
        />
        <Route
          path="/cre/:location"
          element={(
            <LocationRouteGuard>
              <GetTicket />
            </LocationRouteGuard>
          )}
        />
        <Route
          path="/cre/:location/tv"
          element={(
            <LocationRouteGuard>
              <Tv />
            </LocationRouteGuard>
          )}
        />
        <Route
          path="/cre/:location/login"
          element={(
            <LocationRouteGuard>
              <Login />
            </LocationRouteGuard>
          )}
        />
        <Route
          path="/cre/:location/attendent"
          element={(
            <LocationRouteGuard>
              <ProtectedRoute>
                <Attendant />
              </ProtectedRoute>
            </LocationRouteGuard>
          )}
        />
        <Route
          path="/cre/:location/admin"
          element={(
            <LocationRouteGuard>
              <ProtectedRoute requireAdmin>
                <Admin />
              </ProtectedRoute>
            </LocationRouteGuard>
          )}
        />
        <Route path="*" element={<Navigate to={buildLocationHomePath(DEFAULT_UNILAB_LOCATION)} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
