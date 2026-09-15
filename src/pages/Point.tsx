import React from 'react';
import { Route, Routes } from 'react-router-dom';
import PointRegister from './PointRegister';
import PointPanel from './PointPanel';

export default function PointPages() {
  return (
    <Routes>
      <Route path="/register" element={<PointRegister />} />
      <Route path="/*" element={<PointPanel />} />
    </Routes>
  );
}
