'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stage, Layer, Image as KonvaImage, Arrow, Rect, Text, Line } from 'react-konva';
import { motion } from 'framer-motion';
import useImage from 'use-image';
import {
    calculateZoom,
    calculateDistance,
    calculateAngle,
    generateId,
    downloadAnnotatedImage,
    type Annotation,
    type Point,
    type ImageAdjustments
} from '@/lib/image-viewer-utils';

interface ImageViewerProps {
    imageUrl: string;
    imageName: string;
}

type Tool = 'pan' | 'ruler' | 'angle' | 'arrow' | 'rect' | 'text' | null;

export default function ImageViewer({ imageUrl, imageName }: ImageViewerProps) {
    const [image] = useImage(imageUrl, 'anonymous');
    const stageRef = useRef<any>(null);
    const [stageSize, setStageSize] = useState({ width: 800, height: 600 });

    // Image adjustments
    const [adjustments, setAdjustments] = useState<ImageAdjustments>({
        brightness: 0,
        contrast: 0,
        scale: 1,
        position: { x: 0, y: 0 }
    });

    // Tools
    const [activeTool, setActiveTool] = useState<Tool>(null);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [currentPoints, setCurrentPoints] = useState<Point[]>([]);

    // Measurements
    const [measurement, setMeasurement] = useState<string>('');

    useEffect(() => {
        const updateSize = () => {
            const container = document.getElementById('image-viewer-container');
            if (container) {
                setStageSize({
                    width: container.clientWidth,
                    height: Math.min(container.clientHeight, 600)
                });
            }
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, []);

    const handleWheel = (e: any) => {
        e.evt.preventDefault();

        const stage = stageRef.current;
        const oldScale = adjustments.scale;
        const pointer = stage.getPointerPosition();

        const mousePointTo = {
            x: (pointer.x - adjustments.position.x) / oldScale,
            y: (pointer.y - adjustments.position.y) / oldScale,
        };

        const newScale = calculateZoom(oldScale, e.evt.deltaY);

        setAdjustments({
            ...adjustments,
            scale: newScale,
            position: {
                x: pointer.x - mousePointTo.x * newScale,
                y: pointer.y - mousePointTo.y * newScale,
            }
        });
    };

    const handleMouseDown = (e: any) => {
        if (activeTool === 'pan') {
            return; // Pan is handled by draggable stage
        }

        const stage = stageRef.current;
        const pos = stage.getPointerPosition();
        const point = {
            x: (pos.x - adjustments.position.x) / adjustments.scale,
            y: (pos.y - adjustments.position.y) / adjustments.scale
        };

        setIsDrawing(true);
        setCurrentPoints([...currentPoints, point]);

        if (activeTool === 'ruler' && currentPoints.length === 1) {
            const distance = calculateDistance(currentPoints[0], point);
            setMeasurement(`Distance: ${distance.toFixed(2)} px`);
        } else if (activeTool === 'angle' && currentPoints.length === 2) {
            const angle = calculateAngle(currentPoints[0], currentPoints[1], point);
            setMeasurement(`Angle: ${angle.toFixed(2)}°`);
        }
    };

    const handleMouseMove = (e: any) => {
        if (!isDrawing || !activeTool || activeTool === 'pan') return;

        const stage = stageRef.current;
        const pos = stage.getPointerPosition();
        const point = {
            x: (pos.x - adjustments.position.x) / adjustments.scale,
            y: (pos.y - adjustments.position.y) / adjustments.scale
        };

        if (activeTool === 'ruler' && currentPoints.length === 1) {
            const distance = calculateDistance(currentPoints[0], point);
            setMeasurement(`Distance: ${distance.toFixed(2)} px`);
        } else if (activeTool === 'angle' && currentPoints.length === 2) {
            const angle = calculateAngle(currentPoints[0], currentPoints[1], point);
            setMeasurement(`Angle: ${angle.toFixed(2)}°`);
        }
    };

    const handleMouseUp = () => {
        if (!isDrawing) return;

        setIsDrawing(false);

        if (activeTool === 'arrow' && currentPoints.length === 2) {
            const newAnnotation: Annotation = {
                id: generateId(),
                type: 'arrow',
                points: [
                    currentPoints[0].x, currentPoints[0].y,
                    currentPoints[1].x, currentPoints[1].y
                ],
                color: '#ef4444'
            };
            setAnnotations([...annotations, newAnnotation]);
            setCurrentPoints([]);
        } else if (activeTool === 'rect' && currentPoints.length === 2) {
            const newAnnotation: Annotation = {
                id: generateId(),
                type: 'rect',
                x: Math.min(currentPoints[0].x, currentPoints[1].x),
                y: Math.min(currentPoints[0].y, currentPoints[1].y),
                width: Math.abs(currentPoints[1].x - currentPoints[0].x),
                height: Math.abs(currentPoints[1].y - currentPoints[0].y),
                color: '#3b82f6'
            };
            setAnnotations([...annotations, newAnnotation]);
            setCurrentPoints([]);
        }

        if ((activeTool === 'ruler' && currentPoints.length >= 2) ||
            (activeTool === 'angle' && currentPoints.length >= 3)) {
            setCurrentPoints([]);
            setMeasurement('');
        }
    };

    const handleReset = () => {
        setAdjustments({
            brightness: 0,
            contrast: 0,
            scale: 1,
            position: { x: 0, y: 0 }
        });
    };

    const handleExport = async () => {
        if (!stageRef.current) return;

        try {
            const uri = stageRef.current.toDataURL();
            const link = document.createElement('a');
            link.download = `${imageName}_annotated.png`;
            link.href = uri;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Failed to export image:', error);
            alert('Échec de l\'export de l\'image');
        }
    };

    const handleClearAnnotations = () => {
        setAnnotations([]);
        setCurrentPoints([]);
        setMeasurement('');
    };

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <div className="bg-white rounded-xl shadow-lg p-4 border border-gray-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Zoom Controls */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Zoom: {(adjustments.scale * 100).toFixed(0)}%
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setAdjustments({ ...adjustments, scale: Math.max(0.5, adjustments.scale - 0.1) })}
                                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                -
                            </button>
                            <button
                                onClick={handleReset}
                                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                Reset
                            </button>
                            <button
                                onClick={() => setAdjustments({ ...adjustments, scale: Math.min(5, adjustments.scale + 0.1) })}
                                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Brightness */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Luminosité: {adjustments.brightness}
                        </label>
                        <input
                            type="range"
                            min="-100"
                            max="100"
                            value={adjustments.brightness}
                            onChange={(e) => setAdjustments({ ...adjustments, brightness: parseInt(e.target.value) })}
                            className="w-full"
                        />
                    </div>

                    {/* Contrast */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Contraste: {adjustments.contrast}
                        </label>
                        <input
                            type="range"
                            min="-100"
                            max="100"
                            value={adjustments.contrast}
                            onChange={(e) => setAdjustments({ ...adjustments, contrast: parseInt(e.target.value) })}
                            className="w-full"
                        />
                    </div>

                    {/* Tools */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Outils
                        </label>
                        <div className="flex gap-1">
                            <button
                                onClick={() => setActiveTool('ruler')}
                                className={`px-2 py-1 rounded text-sm ${activeTool === 'ruler' ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}
                                title="Règle"
                            >
                                📏
                            </button>
                            <button
                                onClick={() => setActiveTool('angle')}
                                className={`px-2 py-1 rounded text-sm ${activeTool === 'angle' ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}
                                title="Angle"
                            >
                                📐
                            </button>
                            <button
                                onClick={() => setActiveTool('arrow')}
                                className={`px-2 py-1 rounded text-sm ${activeTool === 'arrow' ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}
                                title="Flèche"
                            >
                                ➡️
                            </button>
                            <button
                                onClick={() => setActiveTool('rect')}
                                className={`px-2 py-1 rounded text-sm ${activeTool === 'rect' ? 'bg-emerald-500 text-white' : 'bg-gray-200'}`}
                                title="Rectangle"
                            >
                                ▭
                            </button>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={handleClearAnnotations}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                        Effacer Annotations
                    </button>
                    <button
                        onClick={handleExport}
                        className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                    >
                        Exporter Image
                    </button>
                </div>

                {/* Measurement Display */}
                {measurement && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">{measurement}</p>
                    </div>
                )}
            </div>

            {/* Canvas */}
            <div
                id="image-viewer-container"
                className="bg-gray-900 rounded-xl overflow-hidden border-2 border-gray-700"
                style={{ height: '600px' }}
            >
                <Stage
                    ref={stageRef}
                    width={stageSize.width}
                    height={stageSize.height}
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    draggable={activeTool === 'pan' || activeTool === null}
                    x={adjustments.position.x}
                    y={adjustments.position.y}
                >
                    <Layer>
                        {image && (
                            <KonvaImage
                                image={image}
                                scaleX={adjustments.scale}
                                scaleY={adjustments.scale}
                                filters={adjustments.brightness !== 0 || adjustments.contrast !== 0 ? [] : undefined}
                            />
                        )}

                        {/* Render annotations */}
                        {annotations.map((annotation) => {
                            if (annotation.type === 'arrow' && annotation.points) {
                                return (
                                    <Arrow
                                        key={annotation.id}
                                        points={annotation.points}
                                        stroke={annotation.color}
                                        strokeWidth={3}
                                        fill={annotation.color}
                                    />
                                );
                            } else if (annotation.type === 'rect') {
                                return (
                                    <Rect
                                        key={annotation.id}
                                        x={annotation.x}
                                        y={annotation.y}
                                        width={annotation.width}
                                        height={annotation.height}
                                        stroke={annotation.color}
                                        strokeWidth={2}
                                    />
                                );
                            }
                            return null;
                        })}

                        {/* Render current drawing */}
                        {isDrawing && currentPoints.length > 0 && (
                            <Line
                                points={currentPoints.flatMap(p => [p.x, p.y])}
                                stroke="#fbbf24"
                                strokeWidth={2}
                                dash={[5, 5]}
                            />
                        )}
                    </Layer>
                </Stage>
            </div>
        </div>
    );
}
