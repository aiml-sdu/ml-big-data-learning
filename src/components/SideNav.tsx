import { useState, useCallback, useEffect, useSyncExternalStore } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Lock, Eye } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { NAV_TOPICS } from '../data/nav-topics.ts';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { subscribe, getVersion } from '@/hooks/useSectionProgress';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface SideNavProps {
  activeTopic: string;
  activeSection: string;
}

export default function SideNav({ activeTopic, activeSection }: SideNavProps) {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const progress = useCourseProgress();
  const { isMobile, setOpenMobile } = useSidebar();

  // Subscribe to section-progress changes so visited dots update across all topics
  useSyncExternalStore(subscribe, getVersion);

  // Review mode: enabled if user is signed in OR if VITE_REVIEW_MODE env var is set
  const reviewMode = isSignedIn || !!import.meta.env.VITE_REVIEW_MODE;
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(
    () => new Set(activeTopic ? [activeTopic] : []),
  );

  // Auto-expand when navigating to a new topic
  useEffect(() => {
    if (activeTopic) {
      setExpandedTopics((prev) => {
        if (prev.has(activeTopic)) return prev;
        return new Set(prev).add(activeTopic);
      });
    }
  }, [activeTopic]);

  const closeMobileSidebar = useCallback(() => {
    if (isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);

  const toggleExpand = useCallback((topicId: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) next.delete(topicId);
      else next.add(topicId);
      return next;
    });
  }, []);

  const handleTopicClick = useCallback((topicId: string) => {
    navigate(`/${topicId}`);
    closeMobileSidebar();
  }, [navigate, closeMobileSidebar]);

  const handleSectionClick = useCallback((topicId: string, sectionId: string) => {
    navigate({ pathname: `/${topicId}`, hash: `#${sectionId}` });
    closeMobileSidebar();
  }, [navigate, closeMobileSidebar]);

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-3">
        <span className="font-bold text-lg text-sidebar-foreground">AI101</span>
        <span className="text-xs text-sidebar-foreground/60">Interactive AI Course</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {NAV_TOPICS.map((topic) => {
              const isActive = activeTopic === topic.id;
              const isExpanded = expandedTopics.has(topic.id);
              const hasSections = topic.sections.length > 0;

              if (topic.locked && !reviewMode) {
                return (
                  <SidebarMenuItem key={topic.id}>
                    <SidebarMenuButton className="opacity-50 cursor-not-allowed pointer-events-none">
                      <span className="text-muted-foreground font-mono text-xs">{topic.number}.</span>
                      <span className="flex-1">{topic.title}</span>
                      <Lock className="size-3.5" />
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              if (!hasSections) {
                return (
                  <SidebarMenuItem key={topic.id}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => handleTopicClick(topic.id)}
                    >
                      {topic.number > 0 && (
                        <span className="text-muted-foreground font-mono text-xs">{topic.number}.</span>
                      )}
                      <span>{topic.title}</span>
                      {topic.locked && reviewMode && (
                        <Eye className="size-3 text-amber-500" />
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              }

              return (
                <Collapsible
                  key={topic.id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpand(topic.id)}
                  asChild
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => handleTopicClick(topic.id)}
                      >
                        {topic.number > 0 && (
                          <span className="text-muted-foreground font-mono text-xs">{topic.number}.</span>
                        )}
                        <span className="flex-1">{topic.title}</span>
                        {topic.locked && reviewMode && (
                          <Eye className="size-3 text-amber-500" />
                        )}
                        {(() => {
                          const tp = progress.get(topic.id);
                          return tp && tp.visited > 0 ? (
                            <span className="text-[10px] text-muted-foreground tabular-nums">{tp.visited}/{tp.total}</span>
                          ) : null;
                        })()}
                        <ChevronRight className={`size-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    {(() => {
                      const tp = progress.get(topic.id);
                      return tp && tp.visited > 0 ? (
                        <div className="mx-2 h-0.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all duration-300"
                            style={{ width: `${tp.pct}%` }}
                          />
                        </div>
                      ) : null;
                    })()}
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {topic.sections.map((section) => {
                          const isSectionActive = activeSection === section.id && activeTopic === topic.id;
                          const isSectionVisited = !!localStorage.getItem(`visited-${topic.id}-${section.id}`);
                          return (
                            <SidebarMenuSubItem key={`${topic.id}/${section.id}`}>
                              <SidebarMenuSubButton asChild isActive={isSectionActive} size="sm">
                                <button
                                  type="button"
                                  onClick={() => handleSectionClick(topic.id, section.id)}
                                >
                                  {isSectionVisited && !isSectionActive && (
                                    <span className="size-1.5 rounded-full bg-green-500 shrink-0" />
                                  )}
                                  <span className="text-muted-foreground font-mono text-xs">{section.number}</span>
                                  <span>{section.title}</span>
                                </button>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
