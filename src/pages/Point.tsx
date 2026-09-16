import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PointRegister from './PointRegister';
import PointPanel from './PointPanel';
import PointLogin from './PointLogin';
import { PointsLocator } from './PointsLocator';
import PointRoadmap from './PointRoadmap';

export default function PointPages() {
  return (
    <Routes>
      <Route path="/login" element={<PointLogin />} />
      <Route path="/register" element={<PointRegister />} />
      <Route path="/points" element={<PointsLocator />} />
      <Route path="/locator" element={<PointsLocator />} />
      <Route path="/readmap" element={<PointRoadmap />} />
      <Route path="/roadmap" element={<PointRoadmap />} />
      <Route path="/*" element={<PointPanel />} />
    </Routes>
  );
}
