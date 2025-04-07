import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface LuxuryInstructionCardProps {
  title: string;
  icon: LucideIcon;
  items: string[];
  itemIcon?: LucideIcon;
  indexType?: "number" | "icon";
  className?: string;
}

export function LuxuryInstructionCard({
  title,
  icon: Icon,
  items,
  itemIcon: ItemIcon,
  indexType = "number",
  className,
}: LuxuryInstructionCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden bg-black/60 backdrop-blur-sm rounded-none border border-zinc-800",
        "transition-all duration-500 ease-in-out",
        isHovered ? "border-primary/30 shadow-lg shadow-primary/5" : "border-primary/10",
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      {/* Gold accent corner lines */}
      <div className="absolute top-0 left-0 w-10 h-10 pointer-events-none">
        <div 
          className="absolute top-0 left-0 w-full h-[1px] bg-primary transform origin-left" 
          style={{ 
            width: isHovered ? '100%' : '30%',
            transition: 'width 0.5s ease-in-out'
          }} 
        />
        <div 
          className="absolute top-0 left-0 h-full w-[1px] bg-primary transform origin-top" 
          style={{ 
            height: isHovered ? '100%' : '30%',
            transition: 'height 0.5s ease-in-out'
          }} 
        />
      </div>
      
      <div className="absolute bottom-0 right-0 w-10 h-10 pointer-events-none">
        <div 
          className="absolute bottom-0 right-0 w-full h-[1px] bg-primary transform origin-right" 
          style={{ 
            width: isHovered ? '100%' : '30%',
            transition: 'width 0.5s ease-in-out'
          }} 
        />
        <div 
          className="absolute bottom-0 right-0 h-full w-[1px] bg-primary transform origin-bottom" 
          style={{ 
            height: isHovered ? '100%' : '30%',
            transition: 'height 0.5s ease-in-out'
          }} 
        />
      </div>
      
      {/* Card content */}
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800 mb-6">
          <div className="relative">
            <Icon className={cn(
              "w-6 h-6 transition-all duration-500",
              isHovered ? "text-primary" : "text-primary/80"
            )} />
            
            {isHovered && (
              <motion.div 
                className="absolute -inset-3 rounded-full bg-primary/5 blur-lg z-0"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </div>
          
          <h3 className={cn(
            "font-light tracking-wider uppercase text-xl transition-all duration-500",
            isHovered ? "text-primary" : "text-white"
          )}>
            {title}
          </h3>
        </div>
        
        {/* List items */}
        <ul className="space-y-5">
          {items.map((item, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
              viewport={{ once: true }}
              className="flex items-center gap-3 group"
            >
              {indexType === "number" ? (
                <span className={cn(
                  "flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm border transition-all duration-300",
                  isHovered ? "border-primary text-primary bg-primary/5" : "border-zinc-700 text-zinc-400 bg-black/30"
                )}>
                  {index + 1}
                </span>
              ) : ItemIcon ? (
                <ItemIcon className={cn(
                  "w-5 h-5 flex-shrink-0 transition-all duration-300",
                  isHovered ? "text-primary" : "text-zinc-400"
                )} />
              ) : null}
              
              <span className={cn(
                "text-sm md:text-base transition-all duration-300 font-light tracking-wide",
                isHovered ? "text-white" : "text-zinc-400"
              )}>
                {item}
              </span>
            </motion.li>
          ))}
        </ul>
        
        {/* Decoration line */}
        <div
          className={cn(
            "absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent transition-all duration-700",
            isHovered ? "w-full opacity-40" : "w-0 opacity-0"
          )}
        />
      </div>
    </motion.div>
  );
}