'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Loader, Check } from 'lucide-react';
import plotData from '../../plot-dimensions.json';
import { calculatePlotPrice, formatPrice, formatArea } from '@/lib/utils';

interface BrochureDownloadProps {
    plotNumber: number;
    onDownloadStart?: () => void;
    onDownloadComplete?: () => void;
}

type DownloadState = 'idle' | 'generating' | 'success';

export default function BrochureDownload({
    plotNumber,
    onDownloadStart,
    onDownloadComplete,
}: BrochureDownloadProps) {
    const [downloadState, setDownloadState] = useState<DownloadState>('idle');

    const plot = plotData.plots.find((p) => p.number === plotNumber);
    if (!plot) return null;

    const totalPrice = calculatePlotPrice(plot.area_sqft);

    const generateAndDownloadBrochure = async () => {
        setDownloadState('generating');
        if (onDownloadStart) onDownloadStart();

        try {
            // Generate HTML content for the brochure
            const brochureHTML = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Basava Ganguru - Plot ${plotNumber} Brochure</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #2b2a26;
              line-height: 1.6;
              background: white;
            }
            .container { max-width: 800px; margin: 0 auto; }
            .page { page-break-after: always; padding: 40px; min-height: 100vh; display: flex; flex-direction: column; }
            .page-1 {
              background: linear-gradient(135deg, #0b1120 0%, #1b2540 100%);
              color: #f5f1e6;
              justify-content: center;
              align-items: center;
              text-align: center;
            }
            .page-2 { background: #faf7ef; }
            .logo { font-size: 32px; font-weight: bold; margin-bottom: 20px; }
            .tagline { font-size: 14px; opacity: 0.8; }
            h1 { font-size: 48px; margin: 20px 0; font-weight: 700; letter-spacing: -1px; }
            h2 { font-size: 32px; color: #b8894a; margin: 30px 0 20px; }
            .plot-number { font-size: 64px; font-weight: 800; color: #e3be86; margin: 20px 0; }
            .specs { margin: 30px 0; }
            .spec-item {
              display: flex; justify-content: space-between; align-items: center;
              padding: 15px 0; border-bottom: 1px solid rgba(184, 137, 74, 0.2);
            }
            .spec-label { font-weight: 600; color: #0b1120; }
            .spec-value { font-weight: 700; color: #b8894a; font-size: 18px; }
            .price-box {
              background: linear-gradient(135deg, #e3be86, #b8894a);
              color: #0b1120; padding: 25px; border-radius: 10px; text-align: center;
              margin: 30px 0;
            }
            .price-label { font-size: 14px; opacity: 0.9; }
            .price-value { font-size: 36px; font-weight: 800; }
            .features {
              display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
              margin: 30px 0;
            }
            .feature {
              background: rgba(184, 137, 74, 0.1); padding: 15px;
              border-left: 4px solid #b8894a; border-radius: 4px;
            }
            .feature-title { font-weight: 700; color: #0b1120; margin-bottom: 5px; }
            .feature-desc { font-size: 13px; color: #57544c; }
            .footer {
              margin-top: auto; padding-top: 40px; border-top: 2px solid #b8894a;
              text-align: center; font-size: 12px; color: #8f6a38;
            }
            .contact {
              background: rgba(179, 155, 82, 0.05); padding: 20px;
              border-radius: 8px; margin: 30px 0; text-align: center;
            }
            .contact-phone { font-size: 24px; font-weight: 700; color: #b8894a; margin: 10px 0; }
            @media print {
              body { margin: 0; padding: 0; }
              .page { page-break-after: always; }
            }
          </style>
        </head>
        <body>
          <!-- Page 1: Cover -->
          <div class="page page-1">
            <div style="position: relative; z-index: 1;">
              <div class="logo">🏘️ VCP Developers</div>
              <div class="tagline">Building Dreams. Creating Communities.</div>
              <h1 style="margin-top: 60px; margin-bottom: 10px;">BASAVA GANGURU</h1>
              <div class="tagline" style="font-size: 16px; margin-bottom: 40px;">Residential Layout</div>
              <div class="plot-number">PLOT ${plotNumber}</div>
              <div class="tagline" style="font-size: 14px; margin-top: 30px;">Premium Residential Plot in Shivamogga</div>
            </div>
          </div>

          <!-- Page 2: Details -->
          <div class="page page-2">
            <h2>Plot Specifications</h2>
            
            <div class="specs">
              <div class="spec-item">
                <span class="spec-label">📏 Plot Dimensions</span>
                <span class="spec-value">${plot.width}m × ${plot.depth}m</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">📐 Plot Area</span>
                <span class="spec-value">${plot.area_sqft} sq.ft</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">🧭 Facing Direction</span>
                <span class="spec-value">${plot.facing}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">💰 Price per Sq.ft</span>
                <span class="spec-value">₹2,300</span>
              </div>
            </div>

            <div class="price-box">
              <div class="price-label">TOTAL INVESTMENT</div>
              <div class="price-value">${formatPrice(totalPrice)}</div>
            </div>

            <h2>Premium Features</h2>
            <div class="features">
              <div class="feature">
                <div class="feature-title">🛣️ Wide Roads</div>
                <div class="feature-desc">40ft & 30ft wide internal roads</div>
              </div>
              <div class="feature">
                <div class="feature-title">⚡ 24x7 Electricity</div>
                <div class="feature-desc">Uninterrupted power supply</div>
              </div>
              <div class="feature">
                <div class="feature-title">💧 Water Supply</div>
                <div class="feature-desc">Reliable water connection</div>
              </div>
              <div class="feature">
                <div class="feature-title">🌳 Underground Drainage</div>
                <div class="feature-desc">Modern drainage system</div>
              </div>
              <div class="feature">
                <div class="feature-title">🏞️ Dedicated Park</div>
                <div class="feature-desc">Landscaped green spaces</div>
              </div>
              <div class="feature">
                <div class="feature-title">✅ Ready for Registration</div>
                <div class="feature-desc">Clear titles & approvals</div>
              </div>
            </div>

            <h2>Why Choose Basava Ganguru?</h2>
            <ul style="margin-left: 20px; margin-bottom: 30px;">
              <li style="margin-bottom: 10px;">✨ Premium location with excellent connectivity</li>
              <li style="margin-bottom: 10px;">🎓 Close to educational institutions & hospitals</li>
              <li style="margin-bottom: 10px;">📈 High appreciation potential in fast-developing area</li>
              <li style="margin-bottom: 10px;">🏗️ Well-planned layout with modern infrastructure</li>
              <li>🤝 Transparent dealings with complete documentation</li>
            </ul>

            <div class="contact">
              <div style="font-size: 12px; color: #8f6a38; margin-bottom: 10px;">CONTACT FOR MORE INFORMATION</div>
              <div class="contact-phone">+91 99801 23456</div>
              <div style="font-size: 12px; color: #57544c;">Available 24/7 | Email: info@vcpdevelopers.com</div>
            </div>

            <div class="footer">
              <p style="margin-bottom: 10px;">Vijayalaxmi C Patil Developers & Promoters</p>
              <p>Shivamogga, Karnataka • www.vcpdevelopers.com</p>
              <p style="margin-top: 20px; opacity: 0.6;">Generated on ${new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        </body>
        </html>
      `;

            // Create blob and download
            const blob = new Blob([brochureHTML], { type: 'text/html' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Basava-Ganguru-Plot-${plotNumber}-Brochure.html`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setDownloadState('success');
            if (onDownloadComplete) onDownloadComplete();

            // Reset after 2 seconds
            setTimeout(() => {
                setDownloadState('idle');
            }, 2000);
        } catch (error) {
            console.error('Error generating brochure:', error);
            setDownloadState('idle');
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateAndDownloadBrochure}
            disabled={downloadState !== 'idle'}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${downloadState === 'idle'
                    ? 'bg-[#b8894a] text-white hover:bg-[#8f6a38]'
                    : downloadState === 'generating'
                        ? 'bg-[#b8894a] text-white opacity-75 cursor-not-allowed'
                        : 'bg-[#4b5c42] text-white'
                }`}
        >
            {downloadState === 'idle' ? (
                <>
                    <Download size={18} />
                    Download Brochure
                </>
            ) : downloadState === 'generating' ? (
                <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                        <Loader size={18} />
                    </motion.div>
                    Generating...
                </>
            ) : (
                <>
                    <Check size={18} />
                    Downloaded!
                </>
            )}
        </motion.button>
    );
}