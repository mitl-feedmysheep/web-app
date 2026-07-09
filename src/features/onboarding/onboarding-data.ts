import type { ComponentType } from "react";
import IntroSlide from "./slides/IntroSlide";
import HomeSlide from "./slides/HomeSlide";
import GroupSlide from "./slides/GroupSlide";
import GatheringSlide from "./slides/GatheringSlide";
import PrayerSlide from "./slides/PrayerSlide";
import SermonNotesSlide from "./slides/SermonNotesSlide";
import MySlide from "./slides/MySlide";
import OutroSlide from "./slides/OutroSlide";

export interface FloatingBadge {
  label: string;
  top: string;
  right?: string;
  left?: string;
  callout?: boolean;
  calloutDirection?: "right" | "up" | "up-right";
}

export interface OnboardingSlideData {
  id: string;
  MockComponent: ComponentType;
  hasHighlight: boolean;
  tooltipPosition?: "top" | "bottom";
  tooltipArrow?: "left" | "right";
  tooltipText?: string;
  activeTab?: "/" | "/groups" | "/prayers" | "/sermon-notes" | "/my";
  activeTabLabel?: string;
  // 오버레이 위에 띄울 부가 설명 배지 (여러 개 가능)
  floatingBadges?: FloatingBadge[];
}

const HomeHeaderSlide = () => HomeSlide({ section: "header" });
const HomeSummarySlide = () => HomeSlide({ section: "summary" });
const HomeAnnouncementSlide = () => HomeSlide({ section: "announcement" });
const HomeBirthdaySlide = () => HomeSlide({ section: "birthday" });

export const ONBOARDING_SLIDES: OnboardingSlideData[] = [
  {
    id: "intro",
    MockComponent: IntroSlide,
    hasHighlight: false,
  },
  {
    id: "home-header",
    MockComponent: HomeHeaderSlide,
    hasHighlight: true,
    tooltipPosition: "bottom",
    tooltipArrow: "right",
    tooltipText: "📖 성경 읽기 플랜, 교적부 검색, 알림, 메시지 기능을 이용할 수 있어요.",
    activeTab: "/",
    activeTabLabel: "홈",
  },
  {
    id: "home-summary",
    MockComponent: HomeSummarySlide,
    hasHighlight: true,
    tooltipPosition: "bottom",
    tooltipText: "📋 홈에서는 이번 주 소그룹에서 나눈 나의 한 주 목표와 기도제목을 확인할 수 있어요",
    activeTab: "/",
    activeTabLabel: "홈",
  },
  {
    id: "home-announcement",
    MockComponent: HomeAnnouncementSlide,
    hasHighlight: true,
    tooltipPosition: "bottom",
    tooltipText: "📢 부서 공지사항을 확인할 수 있어요. 새 공지가 오면 푸시 알림도 받아볼 수 있어요",
    activeTab: "/",
    activeTabLabel: "홈",
  },
  {
    id: "home-birthday",
    MockComponent: HomeBirthdaySlide,
    hasHighlight: true,
    tooltipPosition: "top",
    tooltipText: "🎂 이달의 생일자와 📅 교회 일정을 한눈에 볼 수 있어요",
    activeTab: "/",
    activeTabLabel: "홈",
  },
  {
    id: "groups",
    MockComponent: GroupSlide,
    hasHighlight: true,
    tooltipPosition: "bottom",
    tooltipText: "👥 내가 속한 소그룹을 확인하고, 각 모임별 기록을 하며 확인할 수 있어요",
    activeTab: "/groups",
    activeTabLabel: "청년부",
  },
  {
    id: "gathering",
    MockComponent: GatheringSlide,
    hasHighlight: true,
    tooltipPosition: "top",
    tooltipText: "✏️ 모임마다 출석 여부, 나눔 내용, 한주 목표, 기도제목을 각 멤버별로 기록할 수 있어요",
    activeTab: "/groups",
    activeTabLabel: "청년부",
  },
  {
    id: "prayer",
    MockComponent: PrayerSlide,
    hasHighlight: true,
    tooltipPosition: "bottom",
    tooltipText: "🙏 나의 모든 기도제목을 모아볼 수 있어요. 응답된 기도를 돌아보며 하나님의 역사하심과 발자취를 느껴보아요",
    activeTab: "/prayers",
    activeTabLabel: "기도",
  },
  {
    id: "sermon-notes",
    MockComponent: SermonNotesSlide,
    hasHighlight: true,
    tooltipPosition: "bottom",
    tooltipText: "📖 설교를 들으며 노트를 작성하고, 언제든지 읽고 복기할 수 있어요",
    activeTab: "/sermon-notes",
    activeTabLabel: "설교노트",
  },
  {
    id: "my",
    MockComponent: MySlide,
    hasHighlight: true,
    tooltipPosition: "bottom",
    tooltipText: "⚙️ 내 정보 수정, 교회/부서 전환, 알림 설정까지 MY 탭에서 모두 관리할 수 있어요.\n🐛 버그를 발견했거나 원하는 기능·질문이 있으면 버그 신고 · 기능 요청 · 질문사항에서 언제든 남겨주세요 — 제가 직접 답변해 드려요!",
    activeTab: "/my",
    activeTabLabel: "MY",
  },
  {
    id: "outro",
    MockComponent: OutroSlide,
    hasHighlight: false,
  },
];
