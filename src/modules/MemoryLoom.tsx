"use client";

import React, { useState, useCallback, useEffect, memo } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import { useVowThread } from "@/context/VowThreadContext";
import { useSession } from "@/context/SessionContext";
import type { RealtimeMessage } from "@/types";

interface TimelineItem {
  id: string;
  label: string;
  time: string;
}

const INITIAL: TimelineItem[] = [
  { id: "1", label: "Morning coffee", time: "7:00" },
  { id: "2", label: "Check messages", time: "7:30" },
  { id: "3", label: "Deep work", time: "9:00" },
  { id: "4", label: "Lunch break", time: "12:00" },
  { id: "5", label: "Afternoon meetings", time: "14:00" },
];

const SortableItem = memo(function SortableItem({ item }: { item: TimelineItem }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-4 p-4 rounded-[var(--radius)] border border-border
        bg-surface touch-manipulation
        ${isDragging ? "opacity-90 shadow-lg z-10" : ""}
      `}
      {...attributes}
      {...listeners}
      layout
    >
      <span className="text-muted text-sm w-12">{item.time}</span>
      <span className="font-medium flex-1">{item.label}</span>
    </motion.div>
  );
});

export default function MemoryLoomModule() {
  const { contribute, completeModule } = useVowThread();
  const { realtime } = useSession();
  const [items, setItems] = useState(INITIAL);

  useEffect(() => {
    if (!realtime) return;
    const unsub = realtime.subscribe((msg: RealtimeMessage) => {
      if (msg.type === "memory_reorder" && msg.payload.items) {
        setItems(msg.payload.items);
      }
    });
    return unsub;
  }, [realtime]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      setItems((prev) => {
        const oldIndex = prev.findIndex((i) => i.id === active.id);
        const newIndex = prev.findIndex((i) => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        const next = arrayMove(prev, oldIndex, newIndex);
        contribute("memory-loom", {
          memoryTimeline: next.map((item, i) => ({
            id: item.id,
            order: i,
            label: item.label,
            time: item.time,
          })),
        });
        realtime?.send({
          type: "memory_reorder",
          payload: { itemIds: next.map((i) => i.id), items: next },
        });
        return next;
      });
    },
    [contribute, realtime]
  );

  return (
    <div className="py-4 space-y-6">
      <h1 className="text-xl font-bold">Memory Loom</h1>
      <p className="text-muted text-sm">Drag to reorder your timeline</p>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item) => (
              <SortableItem key={item.id} item={item} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <button
        onClick={() => completeModule("memory-loom")}
        className="text-sm text-primary underline mt-4"
      >
        Done with timeline
      </button>
    </div>
  );
}
