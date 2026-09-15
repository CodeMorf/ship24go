import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PointRegister from './PointRegister';
import PointPanel from './PointPanel';
import { PointsLocator } from './PointsLocator';

export default function PointPages() {
  return (
    <Routes>
      <Route path="/register" element={<PointRegister />} />
      <Route path="/points" element={<PointsLocator />} />
      <Route path="/locator" element={<PointsLocator />} />
      <Route path="/*" element={<PointPanel />} />
    </Routes>
  );
}
