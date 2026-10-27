import React from 'react';
import ReactDOM from 'react-dom/client';
import { WeddingPass } from './sections/WeddingPass';
import { WeddingReceptionAccess } from './sections/WeddingReceptionAccess';
import './styles/wedding-workspace.css';
import './styles/wedding-boreal.css';
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode>{location.pathname === '/pase-boda.html' ? <WeddingPass/> : <WeddingReceptionAccess/>}</React.StrictMode>);
