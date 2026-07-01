import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Html5Qrcode } from "html5-qrcode";
import { toast } from "sonner";
import {
  AlertTriangle,
  Award,
  BookOpen,
  Calendar,
  Check,
  CheckCircle,
  Home,
  Layers,
  Play,
  RefreshCcw,
  RotateCcw,
  ScanLine,
  Search,
  SlidersHorizontal,
  StopCircle,
  Users,
  X,
  XCircle,
  User,
  Wifi,
  WifiOff,
  Database,
  CheckSquare,
  ArrowLeftRight,
} from "lucide-react";
import api from "../../api/axios";

/**
 * ====================================================================
 * 📊 الأنماط والتعريفات البرمجية الصارمة (Strict TypeScript Type Definitions)
 * ====================================================================
 */
type Step = "SELECT" | "SCAN" | "SUMMARY";
type SyncStatus = "IDLE" | "SYNCING" | "SUCCESS" | "ERROR";
type CameraMode = "environment" | "user";
type Stage = "PRIMARY" | "MIDDLE" | "HIGH";

type LiveSessionItem = {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  stage: Stage;
  grade: number;
  teacherName: string;
  subject: string;
  roomName: string;
  isOpen?: boolean;
  windowId?: number | null;
  scanWindowStart?: string;
  scanWindowEnd?: string;
};

type StudentItem = {
  id: number;
  name: string;
  phone: string;
  stage: Stage;
  grade: number;
  qrToken: string;
};

type ScannedStudent = StudentItem & {
  scannedAt: string;
  status: "PRESENT" | "LATE" | "ABSENT";
  isOfflineRecord?: boolean;
};

type MonthlyReportRecord = {
  windowId: number;
  sessionId: number;
  sessionName: string;
  teacherName: string;
  subject: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "PRESENT" | "LATE" | "ABSENT";
  lateMinutes: number;
  scannedAt?: string | null;
  markedAt?: string | null;
  autoMarked?: boolean;
  markedBySystem?: boolean;
};

type MonthlyReport = {
  student?: { id: number; name: string; stage?: Stage; grade?: number };
  month?: number;
  year?: number;
  summary?: {
    totalExpectedSessions: number;
    totalPresent: number;
    totalLate: number;
    totalAbsent: number;
    attendanceRate: string;
  };
  details?: MonthlyReportRecord[];
};

type ScanResult = {
  success: boolean;
  studentName: string;
  message: string;
  timestamp: string;
  isOffline?: boolean;
};

const stageLabel: Record<Stage, string> = {
  PRIMARY: "ابتدائي",
  MIDDLE: "إعدادي",
  HIGH: "ثانوي",
};

/**
 * ====================================================================
 * 🔊 نظام التنبيهات الصوتية المتقدم بأعلى شدة صوتية مطلقة
 * ====================================================================
 * تم تثبيت معاملات الصوت البرمجية على القيمة القصوى (1.0) لضمان سماع
 * المساعد للتنبيه بوضوح تام داخل بيئة السنتر المزدحمة والمليئة بالضوضاء.
 */
const playSuccessSound = () => {
  try {
    const audio = new Audio("/ElevenLabs_Generation_3.ogg");
    audio.volume = 1.0; // أعلى تضخيم عتادي متاح للمتصفح
    void audio
      .play()
      .catch((err) =>
        console.log("Audio play blocked by browser policy:", err),
      );
  } catch (error) {
    console.error("❌ [AUDIO SUCCESS SYSTEM ERROR]:", error);
  }
};

const playErrorSound = () => {
  try {
    const audio = new Audio(
      "/ElevenLabs_Failed_save_operation_sound,_settings_menu,_digital-[AudioTrimmer.com].mp3",
    );
    audio.volume = 1.0; // غلق الترددات بأعلى درجة صوتية للتحذير الصارم
    void audio
      .play()
      .catch((err) =>
        console.log("Audio play blocked by browser policy:", err),
      );
  } catch (error) {
    console.error("❌ [AUDIO ERROR SYSTEM ERROR]:", error);
  }
};

function safeString(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  return fallback;
}

/**
 * ====================================================================
 * 🛠️ مترجم ومعالج الأخطاء المعماري للسنتر (Advanced Business Error Translator)
 * ====================================================================
 * يقوم بفحص ترويسات الاستجابات المرتجعة من الخادم (Axios & Prisma Http Status Codes)
 * وتحويلها لرسائل إرشادية ذات طابع توعوي دقيق جداً للمساعد البشري.
 */
function getFriendlyErrorMessage(err: any, fallbackMessage: string): string {
  if (!err) return fallbackMessage;

  if (err.message === "Network Error") {
    return "تعذر الاتصال بالسيرفر، يرجى التحقق من اتصال شبكة الإنترنت الخاصة بالمركز. 🌐";
  }

  const status = err.response?.status;
  const serverMessage = safeString(
    err.response?.data?.error || err.response?.data?.message,
  );

  if (serverMessage) {
    if (
      serverMessage.includes("مسجل له حالة بالفعل") ||
      serverMessage.includes("أمن المنظومة")
    ) {
      return "تنبيه أمني: هذا الطالب تم تسجيل حضوره في هذه المجموعة اليوم بالفعل مسبقاً! ✅";
    }
    if (
      serverMessage.includes("مغلقة حالياً") ||
      serverMessage.includes("محمية من التعديل")
    ) {
      return "عذراً، تم إغلاق وتقييد هذه الحصة التعليمية من قبل الإدارة ولا تستقبل حضوراً حالياً. 🔒";
    }
    if (serverMessage.includes("ليس لديه اشتراك نشط")) {
      return "خرق أمني للاشتراك: هذا الطالب غير مشترك في هذه المجموعة أو انتهت صلاحية باقته! 🛑";
    }
  }

  switch (status) {
    case 400:
      return "البيانات غير مطابقة لقيود الوقت الصارمة، أو أن الحصة انتهى وقتها الإفتراضي اليوم. ⚠️";
    case 401:
      return "انتهت صلاحية الجلسة الحالية للمساعد، يرجى إعادة تسجيل الدخول فوراً لحماية الأكواد. 🔑";
    case 403:
      return "عذراً، لا تمتلك الصلاحية الإدارية الكافية لفتح أو غلق كشوفات الحضور بالسنتر. 🚫";
    case 404:
      return "لم يتم العثور على الطالب بالمنظومة، أو أن الكود الممسوح غير مسجل بقاعدة البيانات. 🔍";
    case 500:
      return "خطأ فادح داخلي بالخادم (Prisma Database Connection Exception)، يرجى مراجعة الإدارة التقنية لـ Sentryk. 🛠️";
    default:
      return serverMessage || fallbackMessage;
  }
}

export default function AttendanceManager() {
  /**
   * ====================================================================
   * 🏗️ حالات إدارة الجلسة والذاكرة المخبئية (State Management & Caching Engine)
   * ====================================================================
   */
  const [step, setStep] = useState<Step>("SELECT");
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string>("");
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("IDLE");

  // معمارية رصد الاتصال اللحظي بالإنترنت (Offline-First State Tracking)
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof window !== "undefined" ? navigator.onLine : true,
  );

  const [sessions, setSessions] = useState<LiveSessionItem[]>([]);
  const [allStudents, setAllStudents] = useState<StudentItem[]>([]);
  const [loadedSessionStudents, setLoadedSessionStudents] = useState<
    StudentItem[]
  >([]);
  const [rosterLoading, setRosterLoading] = useState(false);

  // نظام الفلاتر الديناميكي المتقدم
  const [filterStage, setFilterStage] = useState<string>("ALL");
  const [filterGrade, setFilterGrade] = useState<number | "ALL">("ALL");
  const [filterTeacher, setFilterTeacher] = useState<string>("ALL");
  const [filterRoom, setFilterRoom] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [attendanceQuickFilter, setAttendanceQuickFilter] = useState<
    "ALL" | "PRESENT" | "NOT_SCANNED"
  >("ALL");

  const [selectedSessionIds, setSelectedSessionIds] = useState<number[]>([]);
  const [scannedStudents, setScannedStudents] = useState<
    Map<number, ScannedStudent>
  >(new Map());
  const [absentStudents, setAbsentStudents] = useState<StudentItem[]>([]);
  const [lastScanResult, setLastScanResult] = useState<ScanResult | null>(null);

  // مراجع تحكم الكاميرا والماسح الضوئي العالي السرعة
  const [cameraMode, setCameraMode] = useState<CameraMode>("environment");
  const [cameraError, setCameraError] = useState("");
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanLockRef = useRef(false);
  const isStartingRef = useRef(false);
  const qrReaderRef = useRef<HTMLDivElement>(null);

  // حالات الشاشات المنبثقة (Modals State Dashboard)
  const [isLedgerModalOpen, setIsLedgerModalOpen] = useState(false);
  const [isStudentReportModalOpen, setIsStudentReportModalOpen] =
    useState(false);
  const [, setSelectedLedgerStudent] =
    useState<StudentItem | null>(null);
  const [selectedStudentReport, setSelectedStudentReport] =
    useState<MonthlyReport | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [busyAction, setBusyAction] = useState<string>("");

  const [ledgerSearchQuery, setLedgerSearchQuery] = useState("");
  const [ledgerStage, setLedgerStage] = useState<string>("ALL");
  const [ledgerGrade, setLedgerGrade] = useState<number | "ALL">("ALL");
  const [ledgerSortBy, setLedgerSortBy] = useState<"NAME" | "GRADE" | "STAGE">(
    "NAME",
  );

  /**
   * ====================================================================
   * 🚀 دالة مزامنة طابور الأوفلاين السحابي (Idempotent Bulk Offline Sync Queue)
   * ====================================================================
   * تقوم بتجميع كافة التحضيرات الممسوحة أوفلاين وحقنها دفعة واحدة داخل الباك-إند
   * لتفعيل خطافات إرسال إشعارات الغياب الفورية عبر الواتساب لأولياء الأمور بالسنتر.
   */
  const syncOfflineRecords = useCallback(async () => {
    if (!navigator.onLine) return;
    const localData = localStorage.getItem("sentryk_offline_attendance");
    if (!localData) return;

    try {
      const records = JSON.parse(localData);
      if (Array.isArray(records) && records.length > 0) {
        setSyncStatus("SYNCING");
        const response = await api.post("/attendance/sync", { records });
        if (response.data?.success) {
          toast.success(
            `تمت معالجة طابور الأوفلاين بنجاح: تم دمج ومزامنة عدد [ ${response.data.syncedCount} ] سجل حضور، وتم توليد وإرسال [ ${response.data.messagesSentCount || 0} ] رسالة غياب لأولياء الأمور عبر الواتساب تلقائياً! 📲⚡`,
          );
          localStorage.removeItem("sentryk_offline_attendance");
          setSyncStatus("SUCCESS");
        }
      }
    } catch (err) {
      console.error("❌ [CRITICAL OFFLINE SYNC ERROR]:", err);
      setSyncStatus("ERROR");
      toast.error(
        "فشلت المزامنة التلقائية لطابور الأوفلاين مع السيرفر الرئيسي.",
      );
    }
  }, []);

  /**
   * رصد التغير اللحظي للشبكة وإخطار المستخدم عبر نظام التوست الاحترافي
   */
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("تم استعادة اتصال شبكة السنتر بالإنترنت بنجاح! ⚡", {
        description:
          "جاري تفعيل المعاملات المباشرة وضخ سجلات الأوفلاين المخبأة بسلام.",
        duration: 5000,
      });
      void syncOfflineRecords();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error("تحذير: انقطع الاتصال بالإنترنت بالكامل! ⚠️", {
        description:
          "تم تحويل بوابة السنتر للوضع المحلي (Offline Mode) لحفظ سجلات الطلاب مؤقتاً بالمتصفح.",
        duration: 15000,
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [syncOfflineRecords]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setFetchError("");
    try {
      const [liveSessionsRes, studentsRes] = await Promise.all([
        api.get("/attendance/live-sessions"),
        api.get("/students"),
      ]);
      setSessions(liveSessionsRes.data?.sessions || []);
      setAllStudents(
        studentsRes.data?.students || studentsRes.data?.data || [],
      );
      if (navigator.onLine) {
        void syncOfflineRecords();
      }
    } catch (err: any) {
      setFetchError(
        getFriendlyErrorMessage(
          err,
          "فشل جلب الحصص النشطة وجدول السنتر لليوم، يرجى التحديث ثانيةً.",
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [syncOfflineRecords]);

  useEffect(() => {
    void loadInitialData();
  }, [loadInitialData]);

  // تحديث دوري ذكي لبيانات الجدول وجلب الحصص النشطة كل 30 ثانية
  useEffect(() => {
    const timer = setInterval(() => {
      if (step === "SELECT" && navigator.onLine) {
        void loadInitialData();
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [step, loadInitialData]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if ((scannerRef.current as any).isScanning) {
          await scannerRef.current.stop();
        }
      } catch (e) {
        console.error("❌ [SCANNER STOP EXCEPTION]:", e);
      }
      scannerRef.current = null;
    }
    scanLockRef.current = false;
    isStartingRef.current = false;
  }, []);

  /**
   * ====================================================================
   * 🎥 دورة حياة محرك استقبال الأكواد وكاميرا المسح الفوري (High-Speed Scanner Lifecycle)
   * ====================================================================
   */
  useEffect(() => {
    if (step !== "SCAN") {
      void stopScanner();
      return;
    }

    const startScanner = async () => {
      if (isStartingRef.current || !qrReaderRef.current) return;
      isStartingRef.current = true;

      try {
        await stopScanner();
        const html5QrCode = new Html5Qrcode("qr-reader");
        scannerRef.current = html5QrCode;

        let cameraConfig: any = { facingMode: cameraMode };
        try {
          const devices = await Html5Qrcode.getCameras();
          if (devices?.length) {
            const backCamera = devices.find(
              (d) =>
                d.label?.toLowerCase().includes("back") ||
                d.label?.toLowerCase().includes("rear"),
            );
            cameraConfig = backCamera?.id || devices[0].id;
          }
        } catch {
          // Fallback configuration
        }

        // إطلاق الاستماع بـ 60 إطار بالثانية لالتقاط خارق السرعة ومنع اهتزاز الصورة بالسنتر
        await html5QrCode.start(
          cameraConfig,
          { fps: 60, aspectRatio: 1.0 },
          async (decodedText: string) => {
            if (scanLockRef.current) return;
            scanLockRef.current = true;

            let finalQrToken = decodedText.trim();
            try {
              const parsedJson = JSON.parse(decodedText);
              finalQrToken =
                parsedJson.qrToken ||
                parsedJson.token ||
                parsedJson.id ||
                decodedText;
            } catch {
              console.log("QR code is not JSON, using raw text:", decodedText);
            }

            const matchedStudent = allStudents.find(
              (s) =>
                s.qrToken === finalQrToken || String(s.id) === finalQrToken,
            );

            if (!matchedStudent) {
              playErrorSound();
              setLastScanResult({
                success: false,
                studentName: "كود غير معرف 🛑",
                message:
                  "الرمز الممسوح لا يطابق أي طالب مقيد بـ Sentryk، يرجى إعادة فحص كارت الطالب.",
                timestamp: new Date().toLocaleTimeString("ar-EG"),
              });
              setTimeout(() => {
                scanLockRef.current = false;
              }, 1300);
              return;
            }

            // [الفرع الأول]: معالجة الحضور في وضع انقطاع الإنترنت (Offline Buffer Interceptor)
            if (!navigator.onLine) {
              playSuccessSound();
              const timestamp = new Date().toLocaleTimeString("ar-EG");

              setLastScanResult({
                success: true,
                studentName: matchedStudent.name,
                message:
                  "تم حفظ الحضور محلياً بذاكرة الجهاز الحالية (الوضع الأوفلاين نشط) 💾 وسيتم الرفع فور المزامنة.",
                timestamp,
                isOffline: true,
              });

              setScannedStudents((prev) => {
                const next = new Map(prev);
                next.set(matchedStudent.id, {
                  ...matchedStudent,
                  scannedAt: timestamp,
                  status: "PRESENT",
                  isOfflineRecord: true,
                });
                return next;
              });

              const localData =
                localStorage.getItem("sentryk_offline_attendance") || "[]";
              const parsedRecords = JSON.parse(localData);

              selectedSessionIds.forEach((sid) => {
                parsedRecords.push({
                  studentId: matchedStudent.id,
                  sessionId: sid,
                  status: "PRESENT",
                  scannedAt: new Date().toISOString(),
                  autoMarked: false,
                  markedBySystem: false,
                });
              });

              localStorage.setItem(
                "sentryk_offline_attendance",
                JSON.stringify(parsedRecords),
              );
              setTimeout(() => {
                scanLockRef.current = false;
              }, 1100);
              return;
            }

            // [الفرع الثاني]: إرسال مسح الحضور المباشر للسيرفر مع التوجيه والنقل التلقائي للمجموعات
            try {
              if (selectedSessionIds.length === 0) {
                playErrorSound();
                setLastScanResult({
                  success: false,
                  studentName: matchedStudent.name,
                  message:
                    "خطأ هيكلي: يرجى إلغاء الجلسة واختيار المجموعات المستهدفة أولاً.",
                  timestamp: new Date().toLocaleTimeString("ar-EG"),
                });
                return;
              }

              const response = await api.post("/attendance/scan", {
                qrToken: matchedStudent.qrToken,
                sessionIds: selectedSessionIds,
                status: "PRESENT",
              });

              if (response.data?.success) {
                playSuccessSound();
                const markedSessions = response.data?.markedSessions || [];
                const statusFromServer = markedSessions.some(
                  (x: any) => x.status === "LATE",
                )
                  ? "LATE"
                  : "PRESENT";

                setLastScanResult({
                  success: true,
                  studentName: matchedStudent.name,
                  message: `تم تسجيل الحضور بنجاح وتوجيهه لمجموعته: (${markedSessions.map((m: any) => m.sessionName).join(" + ")}) 🎯`,
                  timestamp: new Date().toLocaleTimeString("ar-EG"),
                });

                setScannedStudents((prev) => {
                  const next = new Map(prev);
                  next.set(matchedStudent.id, {
                    ...matchedStudent,
                    scannedAt: new Date().toLocaleTimeString("ar-EG"),
                    status: statusFromServer,
                  });
                  return next;
                });
              }
            } catch (err: any) {
              playErrorSound();
              setLastScanResult({
                success: false,
                studentName: matchedStudent.name,
                message: getFriendlyErrorMessage(
                  err,
                  "عذراً، الطالب غير مسجل بمجموعات نشطة حالياً بالسنتر 🛑",
                ),
                timestamp: new Date().toLocaleTimeString("ar-EG"),
              });
            } finally {
              setTimeout(() => {
                scanLockRef.current = false;
              }, 1400);
            }
          },
          () => { },
        );
        setCameraError("");
      } catch (err: any) {
        setCameraError(
          getFriendlyErrorMessage(
            err,
            "فشل تشغيل عتاد الكاميرا، تأكد من منح صلاحيات الكاميرا للمتصفح.",
          ),
        );
      } finally {
        isStartingRef.current = false;
      }
    };

    const initInterval = setInterval(() => {
      if (qrReaderRef.current) {
        void startScanner();
        clearInterval(initInterval);
      }
    }, 200);

    return () => {
      clearInterval(initInterval);
      void stopScanner();
    };
  }, [step, cameraMode, allStudents, selectedSessionIds, stopScanner]);

  const uniqueTeachers = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach((s) => s.teacherName && names.add(s.teacherName));
    return Array.from(names);
  }, [sessions]);

  const uniqueRooms = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach((s) => s.roomName && names.add(s.roomName));
    return Array.from(names);
  }, [sessions]);

  const filteredSessions = useMemo(() => {
    return sessions.filter((session) => {
      if (filterStage !== "ALL" && session.stage !== filterStage) return false;
      if (filterGrade !== "ALL" && session.grade !== filterGrade) return false;
      if (filterTeacher !== "ALL" && session.teacherName !== filterTeacher)
        return false;
      if (filterRoom !== "ALL" && session.roomName !== filterRoom) return false;
      if (
        searchQuery &&
        !session.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [
    sessions,
    filterStage,
    filterGrade,
    filterTeacher,
    filterRoom,
    searchQuery,
  ]);

  const ledgerStudents = useMemo(() => {
    const q = ledgerSearchQuery.trim().toLowerCase();
    const items = allStudents.filter((student) => {
      if (ledgerStage !== "ALL" && student.stage !== ledgerStage) return false;
      if (ledgerGrade !== "ALL" && student.grade !== ledgerGrade) return false;
      if (
        q &&
        !(
          student.name.toLowerCase().includes(q) ||
          student.phone.toLowerCase().includes(q)
        )
      )
        return false;
      return true;
    });

    const stageOrder: Record<Stage, number> = {
      PRIMARY: 1,
      MIDDLE: 2,
      HIGH: 3,
    };

    return [...items].sort((a, b) => {
      if (ledgerSortBy === "GRADE") {
        const diff = a.grade - b.grade;
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name, "ar");
      }
      if (ledgerSortBy === "STAGE") {
        const diff = stageOrder[a.stage] - stageOrder[b.stage];
        if (diff !== 0) return diff;
        return a.name.localeCompare(b.name, "ar");
      }
      return a.name.localeCompare(b.name, "ar");
    });
  }, [allStudents, ledgerGrade, ledgerSearchQuery, ledgerSortBy, ledgerStage]);

  const selectedSessions = useMemo(
    () => sessions.filter((s) => selectedSessionIds.includes(s.id)),
    [sessions, selectedSessionIds],
  );

  const fallbackTargetStudents = useMemo(() => {
    if (selectedSessions.length === 0) return [];
    return allStudents.filter((student) =>
      selectedSessions.some(
        (session) =>
          session.stage === student.stage && session.grade === student.grade,
      ),
    );
  }, [allStudents, selectedSessions]);

  const targetStudents = useMemo(() => {
    let list =
      loadedSessionStudents.length > 0
        ? loadedSessionStudents
        : fallbackTargetStudents;
    if (attendanceQuickFilter === "PRESENT")
      return list.filter((s) => scannedStudents.has(s.id));
    if (attendanceQuickFilter === "NOT_SCANNED")
      return list.filter((s) => !scannedStudents.has(s.id));
    return list;
  }, [
    loadedSessionStudents,
    fallbackTargetStudents,
    attendanceQuickFilter,
    scannedStudents,
  ]);

  const toggleSelectSession = (id: number) => {
    setSelectedSessionIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  const loadSelectedSessionStudents = useCallback(
    async (idsToLoad: number[]) => {
      if (idsToLoad.length === 0) {
        setLoadedSessionStudents([]);
        return;
      }

      setRosterLoading(true);
      try {
        if (!navigator.onLine) {
          setLoadedSessionStudents(fallbackTargetStudents);
          return;
        }

        const settled = await Promise.allSettled(
          idsToLoad.map(async (sessionId) => {
            const session = sessions.find((s) => s.id === sessionId);
            const response = await api.get(
              `/attendance/session-students/${sessionId}`,
            );
            const rawStudents = Array.isArray(response.data?.students)
              ? response.data.students
              : [];
            return rawStudents.map((student: any) => {
              const id = Number(student?.id);
              const baseStudent = allStudents.find((s) => s.id === id);
              return {
                id,
                name: safeString(
                  student?.name,
                  baseStudent?.name || "طالب غير معرف",
                ),
                phone: safeString(student?.phone, baseStudent?.phone || ""),
                stage: (session?.stage ||
                  baseStudent?.stage ||
                  "PRIMARY") as Stage,
                grade: Number(session?.grade ?? baseStudent?.grade ?? 0),
                qrToken: safeString(baseStudent?.qrToken, ""),
              };
            });
          }),
        );

        const union = new Map<number, StudentItem>();
        settled.forEach((item) => {
          if (item.status === "fulfilled") {
            item.value.forEach((student: StudentItem) => {
              union.set(student.id, student);
            });
          }
        });

        setLoadedSessionStudents(Array.from(union.values()));
      } finally {
        setRosterLoading(false);
      }
    },
    [sessions, allStudents, fallbackTargetStudents],
  );

  /**
   * ====================================================================
   * 🧠 نظام الفحص الذكي والاستباقي للكاش (Client-First Caching Gatekeeper)
   * ====================================================================
   * يتحقق محلياً من حالة المجموعات المحددة قبل إرسال أي طلبات فتح للسيرفر.
   * إذا كانت الحصص مفتوحة بالفعل ونشطة، ينقل المساعد فوراً لواجهة السكانر
   * ويعرض الطلاب دون أي تأخير أو تكرار لعمليات التفعيل.
   */
  const handleStartAttendanceFlow = useCallback(async () => {
    if (selectedSessionIds.length === 0) return;

    // 🔬 فحص الكاش الاستباقي: هل المجموعات المختارة مفتوحة وجاهزة بالفعل في الواجهة؟
    const allSelectedAreAlreadyOpen = selectedSessionIds.every((id) => {
      const matchedSession = sessions.find((s) => s.id === id);
      return matchedSession?.isOpen === true;
    });

    if (allSelectedAreAlreadyOpen) {
      // 🚀 تجاوز ذكي وسريع جداً: المجموعات مفتوحة مسبقاً، اقطع الطريق السيرفري وافتح الكاميرا
      toast.info(
        "تم رصد تفعيل الجلسة محلياً بالكاش 🔄⚡ تنقلك الواجهة فوراً لغرفة الفحص الآن.",
      );
      await loadSelectedSessionStudents(selectedSessionIds);
      setScannedStudents(new Map());
      setAbsentStudents([]);
      setLastScanResult(null);
      setCameraError("");
      setSyncStatus("IDLE");
      setStep("SCAN");
      return;
    }

    // إذا لم تكن مفتوحة بالكاش، نباشر دورة الاتصال الاعتيادية لتفعيلها على السيرفر
    if (!navigator.onLine) {
      toast.warning(
        "يتم التشغيل الإضطراري والمسح محلياً لعدم وجود إنترنت بالسنتر حالياً.",
      );
      setStep("SCAN");
      return;
    }

    setBusyAction("open");
    setFetchError("");

    try {
      // إرسال طلب تجميعي لفتح المجموعات دفعة واحدة بالتوازي
      const response = await api.post("/attendance/open-sessions", {
        sessionIds: selectedSessionIds,
      });

      if (response.data?.success) {
        toast.success(response.data.message);

        // معالجة إحصائيات الترحيل والنقل الذكي للمجموعات المتتالية وعرضها للمساعد
        const openedSessions = response.data?.openedSessions || [];
        openedSessions.forEach((os: any) => {
          if (os.carriedCount > 0) {
            toast.info(
              `المعالج الذكي للنقل: تم تثبيت حضور [ ${os.carriedCount} ] طلاب تلقائياً في مجموعة (${os.name}) قادمين من الحصة السابقة المتوازية المشتركة! 🚀🎯`,
            );
          }
        });

        await loadInitialData();
        await loadSelectedSessionStudents(selectedSessionIds);

        setScannedStudents(new Map());
        setAbsentStudents([]);
        setLastScanResult(null);
        setCameraError("");
        setSyncStatus("IDLE");
        setStep("SCAN");
        playSuccessSound();
      }
    } catch (err: any) {
      setFetchError(
        getFriendlyErrorMessage(
          err,
          "حدثت مسألة غير متوقعة أثناء معالجة فتح وتجهيز الحصص التعليمية.",
        ),
      );
      playErrorSound();
    } finally {
      setBusyAction("");
    }
  }, [
    selectedSessionIds,
    sessions,
    loadSelectedSessionStudents,
    loadInitialData,
  ]);

  const handleManualToggle = async (
    student: StudentItem,
    forceStatus?: "PRESENT" | "LATE",
  ) => {
    const isCurrentlyScanned = scannedStudents.has(student.id);

    // [الحالة الأولى]: نقرة لإلغاء تحضير الطالب (تحويل حالته إلى غائب ABSENT في السيرفر)
    if (isCurrentlyScanned && !forceStatus) {
      if (!navigator.onLine) {
        toast.error("عذراً، يجب توفر اتصال نشط بالإنترنت لإلغاء الحضور من الخادم الرئيسي! 🌐");
        return;
      }

      setBusyAction(`manual-${student.id}`);
      try {
        if (selectedSessionIds.length === 0) {
          toast.error("خطأ هيكلي: يرجى تحديد المجموعات المستهدفة أولاً.");
          return;
        }

        // تحديث حالة الطالب في السيرفر إلى غائب ABSENT لجميع المجموعات النشطة المحددة بالتوازي
        await Promise.all(
          selectedSessionIds.map((sid) =>
            api.post("/attendance/mark-attendance", {
              studentId: student.id,
              sessionId: sid,
              status: "ABSENT",
              lateMinutes: 0,
            })
          )
        );

        setScannedStudents((prev) => {
          const next = new Map(prev);
          next.delete(student.id);
          return next;
        });

        playErrorSound();
        setLastScanResult({
          success: false,
          studentName: student.name,
          message: "تم إلغاء تحضير الطالب وحذف سجله من المجموعات الحالية بنجاح عبر السيرفر. 🗑️",
          timestamp: new Date().toLocaleTimeString("ar-EG"),
        });
        toast.success(`تم إلغاء تحضير الطالب (${student.name}) من السيرفر.`);
      } catch (err: any) {
        playErrorSound();
        toast.error(getFriendlyErrorMessage(err, "فشل إلغاء تحضير الطالب من قاعدة البيانات."));
      } finally {
        setBusyAction("");
      }
      return;
    }

    // تحديد الحالة المراد إثباتها (حاضر أو متأخر)
    const finalStatus = forceStatus || "PRESENT";

    // الفرع أ: معالجة الحركة في وضع انقطاع الإنترنت (Offline Sync Buffer)
    if (!navigator.onLine) {
      playSuccessSound();
      const timestamp = new Date().toLocaleTimeString("ar-EG");

      setScannedStudents((prev) => {
        const next = new Map(prev);
        next.set(student.id, {
          ...student,
          scannedAt: timestamp,
          status: finalStatus,
          isOfflineRecord: true,
        });
        return next;
      });

      setLastScanResult({
        success: true,
        studentName: student.name,
        message: `[وضع محلي أوفلاين] تم حفظ رصد الطالب بحالة [${finalStatus === "PRESENT" ? "حاضر" : "متأخر"}] بذاكرة المتصفح مؤقتاً. 💾`,
        timestamp,
      });

      const localData = localStorage.getItem("sentryk_offline_attendance") || "[]";
      const parsedRecords = JSON.parse(localData);

      selectedSessionIds.forEach((sid) => {
        parsedRecords.push({
          studentId: student.id,
          sessionId: sid,
          status: finalStatus,
          scannedAt: new Date().toISOString(),
          autoMarked: false,
          markedBySystem: false,
        });
      });

      localStorage.setItem("sentryk_offline_attendance", JSON.stringify(parsedRecords));
      return;
    }

    // الفرع ب: إرسال الحضور اليدوي مباشرة للسيرفر (Online Direct Integration)
    setBusyAction(`manual-${student.id}`);
    try {
      if (selectedSessionIds.length === 0) {
        toast.error("خطأ: لم يتم اختيار أي مجموعة لتسجيل الحضور بها.");
        return;
      }

      // إطلاق طلبات الـ POST بالتوازي عبر الـ API الفعلي لضمان سرعة المعالجة الذرية المطلقة
      await Promise.all(
        selectedSessionIds.map((sid) =>
          api.post("/attendance/mark-attendance", {
            studentId: student.id,
            sessionId: sid,
            status: finalStatus,
            lateMinutes: finalStatus === "LATE" ? 15 : 0, // 15 دقيقة افتراضية في حالة رصد التأخير اليدوي
          })
        )
      );

      playSuccessSound();
      setScannedStudents((prev) => {
        const next = new Map(prev);
        next.set(student.id, {
          ...student,
          scannedAt: new Date().toLocaleTimeString("ar-EG"),
          status: finalStatus,
        });
        return next;
      });

      setLastScanResult({
        success: true,
        studentName: student.name,
        message: `تم إثبات التحضير اليدوي بنجاح استراتيجي تام بالخادم بحالة [${finalStatus === "PRESENT" ? "حاضر" : "متأخر"}] 🎯`,
        timestamp: new Date().toLocaleTimeString("ar-EG"),
      });
    } catch (err: any) {
      playErrorSound();
      setLastScanResult({
        success: false,
        studentName: student.name,
        message: getFriendlyErrorMessage(err, "فشل السيرفر في قبول عملية التحضير اليدوي."),
        timestamp: new Date().toLocaleTimeString("ar-EG"),
      });
      toast.error(getFriendlyErrorMessage(err, "لم يتم تسجيل الحضور اليدوي؛ تفحص قيود الخادم."));
    } finally {
      setBusyAction("");
    }
  };

  /**
   * إنهاء أعمال الجلسة الحالية، واحتساب كشوف الغياب الجماعي التلقائي وضخ رسائل الواتساب
   */
  const handleEndAttendance = useCallback(async () => {
    await stopScanner();

    if (!navigator.onLine) {
      const scannedIds = new Set(scannedStudents.keys());
      const baseList =
        loadedSessionStudents.length > 0
          ? loadedSessionStudents
          : fallbackTargetStudents;
      const absentList = baseList.filter((s) => !scannedIds.has(s.id));
      setAbsentStudents(absentList);
      setStep("SUMMARY");
      setSyncStatus("SUCCESS");
      toast.warning(
        "تم إنهاء الجلسة أوفلاين وحفظ البيانات محلياً. يرجى الاتصال بالإنترنت فوراً لمزامنة المنظومة السحابية 🔐",
      );
      return;
    }

    setSyncStatus("SYNCING");
    try {
      // إغلاق الحصص بالتوازي وتحويل المتخلفين لغائب مع ضخ خطافات الواتساب
      for (const sessionId of selectedSessionIds) {
        await api.post(`/attendance/close-session/${sessionId}`);
      }

      const scannedIds = new Set(scannedStudents.keys());
      const baseList =
        loadedSessionStudents.length > 0
          ? loadedSessionStudents
          : fallbackTargetStudents;
      const absentList = baseList.filter((s) => !scannedIds.has(s.id));

      setAbsentStudents(absentList);
      setStep("SUMMARY");
      setSyncStatus("SUCCESS");
      setFetchError("");
      playSuccessSound();
      toast.success(
        "تم قفل وإغلاق الحصص بنجاح، وتحويل كشوفات الغياب لنظام الإشعارات الآلي! 🔐",
      );
    } catch (e: any) {
      setSyncStatus("ERROR");
      setFetchError(
        getFriendlyErrorMessage(
          e,
          "تعذر إنهاء وإقفال الحصص على السيرفر حالياً، يرجى مراجعة الشبكة.",
        ),
      );
      playErrorSound();
    }
  }, [
    scannedStudents,
    selectedSessionIds,
    stopScanner,
    loadedSessionStudents,
    fallbackTargetStudents,
  ]);

  const fetchRealMonthlyReport = async (student: StudentItem) => {
    if (!navigator.onLine) {
      alert(
        "عذراً، فحص التقرير التراكمي الشهري الحي يتطلب اتصالاً نشطاً بالإنترنت للاتصال بقاعدة بيانات Sentryk 🌐",
      );
      return;
    }
    setReportLoading(true);
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    try {
      const res = await api.get(
        `/attendance/monthly-report/${student.id}?month=${currentMonth}&year=${currentYear}`,
      );
      if (res.data?.success) {
        setSelectedLedgerStudent(student);
        setSelectedStudentReport(res.data);
        setIsLedgerModalOpen(false);
        setIsStudentReportModalOpen(true);
      } else {
        alert(res.data?.error || "فشل احتساب التقرير الشهري للطالب.");
      }
    } catch (err: any) {
      alert(
        getFriendlyErrorMessage(
          err,
          "فشل جلب أرقام التقرير الشهري اللحظي من قاعدة البيانات.",
        ),
      );
    } finally {
      setReportLoading(false);
    }
  };

const resetSession = async () => {
  await stopScanner();
  setSelectedSessionIds([]);
  setScannedStudents(new Map());
  setAbsentStudents([]);
  setLastScanResult(null);
  setSyncStatus("IDLE");
  
  // 1. جلب البيانات فوراً من السيرفر لتحديث القائمة وحذف الحصص المغلقة
  if (navigator.onLine) {
    await loadInitialData(); 
  }

  // 2. الانتقال لشاشة الاختيار بعد التحديث
  setStep("SELECT");
  
  setSelectedStudentReport(null);
  setCameraError("");
  setFetchError("");
  setLoadedSessionStudents([]);
  setAttendanceQuickFilter("ALL");
};

  return (
    <div
      className="min-h-screen bg-[#f8fafc] dark:bg-[#020617] p-4 md:p-6 text-right font-sans transition-colors duration-300 select-none"
      dir="rtl"
    >
      {/* 🌐 شريط الاتصال وحالة الإنترنت اللحظية */}
      <div className="max-w-7xl mx-auto mb-4 flex justify-end">
        <div
          className={`px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-2 shadow-sm border ${isOnline ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"}`}
        >
          {isOnline ? (
            <>
              {" "}
              <Wifi size={14} /> اتصال السنتر مستقر وبث مباشر (Online Mode){" "}
            </>
          ) : (
            <>
              {" "}
              <WifiOff size={14} /> انقطع الاتصال! الاسكانر يعمل محلياً بالكامل
              (Offline Mode){" "}
            </>
          )}
        </div>
      </div>

      {/* 📊 الرأس الرئيسي وبانل التحكم في الجلسة */}
      <div className="max-w-7xl mx-auto mb-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 rounded-[2rem] p-5 md:p-6 shadow-xl border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg">
              <ScanLine className="text-white" size={28} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                بوابة استقبال وتسجيل حضور الطلاب الذكية ⚡
              </h1>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                نظام النقل الموازي المتتالي، ومكافحة التكرار الاستباقية، والرصد
                المباشر في كشوفات نظام Sentryk لعام 2026.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setIsLedgerModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-all shadow-sm"
            >
              <Calendar size={16} className="text-indigo-500" /> كشف الفحص
              والمتابعة الشهرية للطلاب
            </button>
            {step !== "SELECT" && (
              <button
                onClick={resetSession}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/30 text-rose-600 border border-rose-100 dark:border-rose-900/50 flex items-center gap-2 hover:bg-rose-100 transition-all"
              >
                <RotateCcw size={16} /> تصفير وإلغاء الجلسة الحالية
              </button>
            )}
            <button
              onClick={loadInitialData}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/10"
            >
              <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />{" "}
              تحديث الجداول والطلاب لليوم
            </button>
          </div>
        </div>

        {/* 📈 كروت البيانات المباشرة للسنتر */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            {
              label: "المجموعات النشطة المفتوحة بالاسكانر",
              value: selectedSessionIds.length,
              color: "text-indigo-600 dark:text-indigo-400",
            },
            {
              label: "إجمالي الطلاب المقيدين بالحصص",
              value: targetStudents.length,
              color: "text-cyan-600 dark:text-cyan-400",
            },
            {
              label: "الطلاب الذين سجلوا دخول بنجاح",
              value: scannedStudents.size,
              color: "text-emerald-600 dark:text-emerald-400",
            },
            {
              label: "حالات الغياب الرصدي التقديري لليوم",
              value: absentStudents.length,
              color: "text-rose-600 dark:text-rose-400",
            },
          ].map((box) => (
            <div
              key={box.label}
              className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-4 shadow-sm border border-slate-200/60 dark:border-slate-800/60"
            >
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500">
                {box.label}
              </p>
              <p className={`text-2xl font-black ${box.color} mt-1`}>
                {box.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <hr className="max-w-7xl mx-auto my-6 border-slate-200 dark:border-slate-800" />

      {/* 💡 خريطة وشرح ميزات المعمارية والربط المتتالي الذكي للطلاب */}
      <div className="max-w-7xl mx-auto mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* الكرت الأول: إدارة الحصص المتعددة والنقل الذكي */}
        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 p-6 rounded-2xl border border-indigo-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-black text-sm">
            <ArrowLeftRight size={18} /> إدارة الحصص المتعددة وآلية النقل الذكي للطلاب ⚡
          </div>
          <p className="text-xs leading-5 text-slate-600 dark:text-slate-300 text-justify">
            يمنح النظام السكرتارية صلاحية خارقة لـ{" "}
            <strong>فتح واختيار أكثر من حصة أو مجموعة في نفس الوقت</strong> لتسجيل
            حضور الطلاب فيها معاً بضغطة واحدة. بالإضافة إلى ذلك، يتتبّع النظام جدول
            الطالب بذكاء لمنع وقوفه المتكرر في الطوابير؛ فإذا سجل الطالب حضوراً في
            حصة <strong>(اللغة العربية)</strong> المنتهية الآن، وكان مقيداً في حصة{" "}
            <strong>(الفيزياء)</strong> التالية التي تبدأ بعدها مباشرة{" "}
            <strong>(بفارق زمني أقل من 30 دقيقة)</strong>، يقوم السيرفر تلقائياً{" "}
            <strong>بترحيله وتثبيت حضوره في حصة الفيزياء</strong> بمجرد فتحها من قِبل
            الإدارة، دون أن يحتاج الطالب لإعادة مسح كرته أو الوقوف في الزحام مجدداً.
          </p>
        </div>

        {/* الكرت الثاني: السرعة الفائقة والتحضير بدون إنترنت */}
        <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-slate-900 dark:to-slate-950 p-6 rounded-2xl border border-emerald-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-sm">
            <Database size={18} /> السرعة اللحظية والتحضير الآمن عند انقطاع الإنترنت 💾
          </div>
          <p className="text-xs leading-5 text-slate-600 dark:text-slate-300 text-justify">
            تم تصميم هذه الميزة لتضمن للمساعدين سرعة مسح فائقة وتمنع تعليق شاشة
            الاسكانر نهائياً؛ فالواجهة تقرأ بيانات الحصة المفتوحة من الذاكرة اللحظية
            لجهازك فوراً لتفادي الضغط على الشبكة. وفي حال انقطاع الإنترنت فجأة داخل
            السنتر، <strong>لن يتوقف العمل نهائياً!</strong> يمكنك الاستمرار في مسح
            كروت الطلاب وتوثيق حضورهم بشكل طبيعي، حيث تُحفظ البيانات مشفرة داخل ذاكرة
            المتصفح مؤقتاً.
            <span className="block mt-2 font-bold text-amber-600 dark:text-amber-400">
              ⚠️ تنبيه هام للسكرتارية: فور عودة شبكة الإنترنت، يجب فتح هذه الصفحة من
              "نفس الجهاز" الذي استخدمتموه في المسح، ليقوم النظام تلقائياً برفع وتزامن
              كافة سجلات الحضور المحفوظة إلى السيرفر الرئيسي بنجاح.
            </span>
          </p>
        </div>

        {/* الكرت الثالث: منع التكرار، حساب التأخير، ورسائل الواتساب الفورية */}
        <div className="bg-gradient-to-br from-purple-50 to-white dark:from-slate-900 dark:to-slate-950 p-6 rounded-2xl border border-purple-100 dark:border-slate-800 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-purple-700 dark:text-purple-400 font-black text-sm">
            <CheckSquare size={18} /> حماية التكرار، حساب قواعد التأخير، ورسائل WhatsApp 🛡️
          </div>
          <p className="text-xs leading-5 text-slate-600 dark:text-slate-300 text-justify">
            نظام أمان صارم يمنع الأخطاء البشرية؛ حيث يحظر النظام مسح كارت الطالب أكثر
            من مرة واحدة في نفس المجموعة لليوم لمنع تكرار البيانات أو التلاعب بها. كما
            يقوم النظام باحتساب التأخير آلياً بدقة متناهية:{" "}
            <strong>إذا مرت 10 دقائق كاملة على موعد بدء الحصة الفعلي</strong> ودخل
            الطالب بعدها، يتم إدراج حالته تلقائياً كـ (متأخر) مع حساب الدقائق بدقة.
            والأهم من ذلك، <strong>بمجرد قيام السكرتارية بإغلاق وإنهاء الحصة</strong>{" "}
            من لوحة التحكم، يقوم النظام فوراً وبشكل آلي بتوليد وإرسال رسائل الغياب
            والتأخير المفصلة إلى هواتف أولياء الأمور عبر تطبيق <strong>WhatsApp</strong>{" "}
            لإحاطتهم بمستوى انضباط أبنائهم أولاً بأول.
          </p>
        </div>
      </div>

      {/* 🧭 معالج شاشات التدفق والخطوات الشاملة */}
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {/* ========================================================== */}
          {/* الخطوة الأولى: شاشة جلب واختيار مجموعات السنتر لليوم */}
          {/* ========================================================== */}
          {step === "SELECT" && (
            <motion.div
              key="select-screen"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-6"
            >
              <div className="lg:col-span-1 bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-md border border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-5 sticky top-6 h-fit">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <SlidersHorizontal size={18} className="text-indigo-600" />
                  <h2 className="font-black text-slate-900 dark:text-white text-sm">
                    تخصيص الفرز والبحث السريع
                  </h2>
                </div>

                <div className="relative">
                  <Search
                    className="absolute right-3 top-3 text-slate-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="ابحث عن اسم الحصة..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-bold text-right focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-500 flex items-center gap-1">
                    <Layers size={12} /> المرحلة الدراسية
                  </label>
                  <div className="grid grid-cols-2 gap-1">
                    {[
                      ["ALL", "الكل"],
                      ["PRIMARY", "ابتدائي"],
                      ["MIDDLE", "إعدادي"],
                      ["HIGH", "ثانوي"],
                    ].map(([val, name]) => (
                      <button
                        key={val}
                        onClick={() => {
                          setFilterStage(val);
                          setFilterGrade("ALL");
                        }}
                        className={`py-2 px-1 rounded-xl text-xs font-bold border transition-all ${filterStage === val ? "bg-indigo-600 border-indigo-600 text-white" : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300"}`}
                      >
                        {name}
                      </button>
                    ))}
                  </div>
                </div>

                {filterStage !== "ALL" && (
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-black text-slate-500 flex items-center gap-1">
                      <BookOpen size={12} /> الصف الدراسي
                    </label>
                    <select
                      value={filterGrade}
                      onChange={(e) =>
                        setFilterGrade(
                          e.target.value === "ALL"
                            ? "ALL"
                            : Number(e.target.value),
                        )
                      }
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="ALL">جميع صفوف المرحلة</option>
                      {filterStage === "PRIMARY" &&
                        [1, 2, 3, 4, 5, 6].map((g) => (
                          <option key={g} value={g}>
                            الصف {g}
                          </option>
                        ))}
                      {(filterStage === "MIDDLE" || filterStage === "HIGH") &&
                        [1, 2, 3].map((g) => (
                          <option key={g} value={g}>
                            الصف {g}
                          </option>
                        ))}
                    </select>
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-500 flex items-center gap-1">
                    <User size={12} /> المدرس المحاضر
                  </label>
                  <select
                    value={filterTeacher}
                    onChange={(e) => setFilterTeacher(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="ALL">جميع مدرسي السنتر</option>
                    {uniqueTeachers.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-500 flex items-center gap-1">
                    <Home size={12} /> القاعة الاستيعابية
                  </label>
                  <select
                    value={filterRoom}
                    onChange={(e) => setFilterRoom(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="ALL">جميع القاعات المتاحة</option>
                    {uniqueRooms.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleStartAttendanceFlow}
                  disabled={
                    selectedSessionIds.length === 0 ||
                    busyAction === "open" ||
                    rosterLoading
                  }
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-300 disabled:to-slate-300 text-white font-black text-xs rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
                >
                  <Play size={14} fill="currentColor" /> بدء استقبال المجموعات
                  المحددة ({selectedSessionIds.length})
                </button>
              </div>

              <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-md border border-slate-200/60 dark:border-slate-800/60">
                <div className="flex items-center justify-between mb-6 pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="text-indigo-600" /> كشوف المجموعات المتاحة
                    للاستقبال لليوم ({filteredSessions.length})
                  </h2>
                </div>

                {fetchError && (
                  <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2 mb-4 whitespace-pre-wrap">
                    <AlertTriangle size={16} className="shrink-0" />{" "}
                    {fetchError}
                  </div>
                )}

                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"
                      />
                    ))}
                  </div>
                ) : filteredSessions.length === 0 ? (
                  <div className="py-24 text-center">
                    <Users className="mx-auto text-slate-300 mb-3" size={44} />
                    <p className="text-xs font-bold text-slate-400">
                      لا توجد أي حصص نشطة متوافقة مع خيارات الفرز المحددة
                      حالياً.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredSessions.map((session) => {
                      const isSelected = selectedSessionIds.includes(
                        session.id,
                      );
                      return (
                        <div
                          key={session.id}
                          onClick={() => toggleSelectSession(session.id)}
                          className={`p-5 rounded-[1.75rem] border transition-all cursor-pointer flex flex-col justify-between gap-4 relative overflow-hidden ${isSelected ? "bg-gradient-to-br from-indigo-50/60 to-white dark:from-indigo-950/20 dark:to-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/10" : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-black ${session.stage === "HIGH" ? "bg-rose-50 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400" : session.stage === "MIDDLE" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"}`}
                              >
                                {stageLabel[session.stage]} - الصف{" "}
                                {session.grade}
                              </span>
                              <h3 className="text-sm font-black text-slate-800 dark:text-white mt-2">
                                {session.name}
                              </h3>
                              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-0.5">
                                {session.subject} • أ/{session.teacherName}
                              </p>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${isSelected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 bg-slate-50"}`}
                            >
                              {isSelected && (
                                <Check size={12} strokeWidth={3} />
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
                            <span className="flex items-center gap-1">
                              <Home size={12} /> {session.roomName}
                            </span>
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md font-mono text-slate-600 dark:text-slate-300">
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* الخطوة الثانية: شاشة المسح الفوري وتكبير عدسة ماسح الـ QR */}
          {/* ========================================================== */}
          {step === "SCAN" && (
            <motion.div
              key="scan-screen"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* تضخيم وتكبير عدسة مسح كارت الـ QR لمنع بطء الطوابير */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <h2 className="font-black text-slate-900 dark:text-white text-sm">
                        عدسة المسح والالتقاط الضوئي الفوري 🎥
                      </h2>
                      <p className="text-[11px] font-bold text-slate-400 mt-0.5">
                        وجه كارت كود الطالب بالكامل داخل المربع للتسجيل اللحظي.
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setCameraMode((p) =>
                          p === "environment" ? "user" : "environment",
                        )
                      }
                      className="p-2 rounded-xl bg-slate-50 text-slate-600 border hover:bg-slate-100 transition-all text-xs font-bold"
                    >
                      قلب الكاميرا
                    </button>
                  </div>

                  {/* 📷 هيكل عدسة الماسح الكبيرة المطورة بالكامل لمظهر scannable احترافي */}
                  <div className="relative aspect-square w-full mx-auto max-w-[380px] bg-black rounded-2xl overflow-hidden shadow-inner border-4 border-slate-800 group">
                    <div
                      id="qr-reader"
                      ref={qrReaderRef}
                      className="w-full h-full [&_video]:object-cover"
                    />

                    {/* طبقة واجهة تحديد المربع الضوئي الضخم المحدث */}
                    <div className="absolute inset-0 border-[35px] border-black/40 pointer-events-none flex items-center justify-center">
                      <div className="w-full h-full border-4 border-dashed border-indigo-500 rounded-lg animate-pulse relative">
                        {/* زوايا الفحص الحصرية المحصنة للمظهر الفخم */}
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 border-t-4 border-r-4 border-pink-500" />
                        <div className="absolute -top-1.5 -left-1.5 w-6 h-6 border-t-4 border-l-4 border-pink-500" />
                        <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 border-b-4 border-r-4 border-pink-500" />
                        <div className="absolute -bottom-1.5 -left-1.5 w-6 h-6 border-b-4 border-l-4 border-pink-500" />
                      </div>
                    </div>

                    {cameraError && (
                      <div className="absolute inset-0 bg-slate-900/90 text-white p-6 flex flex-col items-center justify-center text-center gap-2">
                        <AlertTriangle className="text-amber-500" size={32} />
                        <p className="text-xs font-bold">{cameraError}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleEndAttendance}
                    disabled={syncStatus === "SYNCING"}
                    className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-600/10 flex items-center justify-center gap-2"
                  >
                    <StopCircle size={14} /> إنهاء أعمال الفحص وإقفال الحصة
                    الحالية يدوياً
                  </button>
                </div>

                {/* 📋 لوحة نتائج الفحص الفوري والأخير للطالب */}
                {lastScanResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-5 rounded-2xl border flex flex-col gap-2 ${lastScanResult.success ? "bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-300" : "bg-rose-50/70 border-rose-200 text-rose-900 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-300"}`}
                  >
                    <div className="flex items-center justify-between border-b pb-2 border-current/10">
                      <div className="flex items-center gap-2">
                        {lastScanResult.success ? (
                          <CheckCircle size={18} className="text-emerald-600" />
                        ) : (
                          <XCircle size={18} className="text-rose-600" />
                        )}
                        <span className="text-xs font-black tracking-wide">
                          {lastScanResult.studentName}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] opacity-60">
                        {lastScanResult.timestamp}
                      </span>
                    </div>
                    <p className="text-xs font-bold leading-5">
                      {lastScanResult.message}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* 👥 جدول واستعراض طلاب الحصة الحاضرين محلياً بشكل فوري */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-lg border border-slate-200 dark:border-slate-800 flex flex-col gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 border-slate-100 dark:border-slate-800 gap-3">
                  <div>
                    <h2 className="text-base font-black text-slate-900 dark:text-white">
                      قائمة ومراقبة الطلاب المقيدين بالجلسة الحالية
                    </h2>
                    <p className="text-xs font-bold text-slate-400 mt-0.5">
                      مراقبة ورصد الحضور اللحظي والتأخير الذكي بالسنتر.
                    </p>
                  </div>

                  {/* أزرار فرز سريعة وذكية لكشوف الحضور المباشر */}
                  <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                    {[
                      ["ALL", "الكل"],
                      ["PRESENT", "الحاضرين"],
                      ["NOT_SCANNED", "المتبقين"],
                    ].map(([mode, label]) => (
                      <button
                        key={mode}
                        onClick={() => setAttendanceQuickFilter(mode as any)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${attendanceQuickFilter === mode ? "bg-white dark:bg-slate-900 text-indigo-600 shadow-sm font-black" : "text-slate-500 hover:text-slate-700"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {rosterLoading ? (
                  <div className="py-20 text-center animate-pulse text-xs font-bold text-slate-400">
                    جاري معالجة وتجهيز سجلات كشوف الطلاب التابعة للمجموعات...
                  </div>
                ) : targetStudents.length === 0 ? (
                  <div className="py-20 text-center text-xs font-bold text-slate-400">
                    لا توجد سجلات طلاب مطابقة لخيارات التصفية الحالية بالجلسة.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-right text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-black">
                          <th className="pb-3 text-right">
                            اسم الطالب التعليمي
                          </th>
                          <th className="pb-3 text-center">المرحلة / الصف</th>
                          <th className="pb-3 text-center">
                            حالة الحضور اليوم
                          </th>
                          <th className="pb-3 text-center">توقيت التحضير</th>
                          <th className="pb-3 text-left">تحكم يدوي إداري</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {targetStudents.map((student) => {
                          const scanInfo = scannedStudents.get(student.id);
                          const isScanned = !!scanInfo;
                          return (
                            <tr
                              key={student.id}
                              className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                            >
                              <td className="py-3.5 font-black text-slate-800 dark:text-slate-200">
                                <div className="flex flex-col">
                                  <span>{student.name}</span>
                                  <span className="text-[10px] text-slate-400 font-mono mt-0.5">
                                    {student.phone || "بدون رقم هاتف متاح"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3.5 text-center font-bold text-slate-500">
                                {stageLabel[student.stage]} - ص {student.grade}
                              </td>
                              <td className="py-3.5 text-center">
                                <span
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-black ${isScanned ? (scanInfo.status === "LATE" ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30" : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30") : "bg-slate-50 text-slate-400"}`}
                                >
                                  {isScanned
                                    ? scanInfo.status === "LATE"
                                      ? "متأخر ⏳"
                                      : "حاضر ✓"
                                    : "لم يحضر بعد"}
                                </span>
                              </td>
                              <td className="py-3.5 text-center font-mono text-slate-400 font-bold">
                                {isScanned ? scanInfo.scannedAt : "--:--"}
                              </td>
                              <td className="py-3.5 text-left">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() =>
                                      handleManualToggle(student, "PRESENT")
                                    }
                                    className={`px-2 py-1 rounded-md text-[10px] font-black border transition-all ${isScanned && scanInfo.status === "PRESENT" ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                                  >
                                    حاضر
                                  </button>
                                  <button
                                    onClick={() =>
                                      handleManualToggle(student, "LATE")
                                    }
                                    className={`px-2 py-1 rounded-md text-[10px] font-black border transition-all ${isScanned && scanInfo.status === "LATE" ? "bg-amber-500 border-amber-500 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
                                  >
                                    متأخر
                                  </button>
                                  {isScanned && (
                                    <button
                                      onClick={() =>
                                        handleManualToggle(student)
                                      }
                                      className="p-1 rounded-md text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200"
                                      title="إلغاء الحضور"
                                    >
                                      <X size={12} strokeWidth={3} />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ========================================================== */}
          {/* الخطوة الثالثة: شاشة الملخص الختامي وإحصائيات الغياب الجماعي */}
          {/* ========================================================== */}
          {step === "SUMMARY" && (
            <motion.div
              key="summary-screen"
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col gap-6"
            >
              <div className="text-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                  <CheckSquare size={32} />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  تم قفل كشوف الجلسة وحفظ السجلات بنجاح! 🎉
                </h2>
                <p className="text-xs font-bold text-slate-400">
                  ملخص رصد الحضور والغياب للمجموعات التعليمية المختارة اليوم
                  بالسنتر.
                </p>
              </div>

              {/* بطاقات أرقام الغياب والحضور النهائية للمجموعات */}
              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto w-full">
                <div className="bg-emerald-50/50 dark:bg-slate-800 text-center p-4 rounded-2xl border border-emerald-100 dark:border-slate-700">
                  <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 block">
                    حاضر (طبيعي)
                  </span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1 block">
                    {
                      Array.from(scannedStudents.values()).filter(
                        (s) => s.status === "PRESENT",
                      ).length
                    }
                  </span>
                </div>
                <div className="bg-amber-50/50 dark:bg-slate-800 text-center p-4 rounded-2xl border border-amber-100 dark:border-slate-700">
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 block">
                    حضور (متأخر)
                  </span>
                  <span className="text-xl font-black text-amber-500 dark:text-amber-400 mt-1 block">
                    {
                      Array.from(scannedStudents.values()).filter(
                        (s) => s.status === "LATE",
                      ).length
                    }
                  </span>
                </div>
                <div className="bg-rose-50/50 dark:bg-slate-800 text-center p-4 rounded-2xl border border-rose-100 dark:border-slate-700">
                  <span className="text-[10px] font-black text-rose-700 dark:text-rose-400 block">
                    إجمالي غياب الكشف
                  </span>
                  <span className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1 block">
                    {absentStudents.length}
                  </span>
                </div>
              </div>

              {/* قائمة استعراض كشف الطلاب المتغيبين لليوم وتأكيد الإرسال */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-2xl p-4">
                <h3 className="text-xs font-black text-slate-800 dark:text-white mb-3 flex items-center gap-1">
                  <AlertTriangle size={14} className="text-rose-500" /> كشف
                  تفصيلي بالطلاب المتغيبين لليوم ({absentStudents.length} طالب)
                </h3>
                {absentStudents.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 text-center py-6">
                    ممتاز! نسبة حضور 100%؛ لا يوجد غياب في كشوفات هذه المجموعة
                    لليوم ⭐
                  </p>
                ) : (
                  <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/50">
                    {absentStudents.map((student) => (
                      <div
                        key={student.id}
                        className="py-2.5 flex items-center justify-between text-xs"
                      >
                        <span className="font-black text-slate-700 dark:text-slate-300">
                          {student.name}
                        </span>
                        <span className="font-mono text-slate-400 font-bold">
                          {student.phone || "بدون هاتف مسجل"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-center pt-2">
                <button
                  onClick={resetSession}
                  className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs shadow-md transition-all"
                >
                  الرجوع للرئيسية واستقبال مجموعات جديدة
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ========================================================== */}
      {/* 🏙️ نافذة مودال: الفحص الشامل والمتابعة الشهرية التراكمية للطلاب */}
      {/* ========================================================== */}
      {isLedgerModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-4xl max-h-[85vh] overflow-hidden p-6 shadow-2xl border flex flex-col gap-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="text-indigo-600" /> كشف الفحص والمتابعة
                التراكمية لطلاب السنتر
              </h2>
              <button
                onClick={() => setIsLedgerModalOpen(false)}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* شريط أدوات وفلاتر فرز الطلاب التراكمي */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="ابحث باسم الطالب أو رقم الهاتف..."
                value={ledgerSearchQuery}
                onChange={(e) => setLedgerSearchQuery(e.target.value)}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 border text-slate-900 dark:text-white dark:bg-slate-800"
              />
              <select
                value={ledgerStage}
                onChange={(e) => {
                  setLedgerStage(e.target.value);
                  setLedgerGrade("ALL");
                }}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 border text-slate-900 dark:text-white dark:bg-slate-800"
              >
                <option value="ALL">جميع المراحل</option>
                <option value="PRIMARY">ابتدائي</option>
                <option value="MIDDLE">إعدادي</option>
                <option value="HIGH">ثانوي</option>
              </select>
              <select
                value={ledgerGrade}
                onChange={(e) =>
                  setLedgerGrade(
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value),
                  )
                }
                className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 border text-slate-900 dark:text-white dark:bg-slate-800"
              >
                <option value="ALL">جميع الصفوف</option>
                {ledgerStage === "PRIMARY" &&
                  [1, 2, 3, 4, 5, 6].map((g) => (
                    <option key={g} value={g}>
                      الصف {g}
                    </option>
                  ))}
                {(ledgerStage === "MIDDLE" || ledgerStage === "HIGH") &&
                  [1, 2, 3].map((g) => (
                    <option key={g} value={g}>
                      الصف {g}
                    </option>
                  ))}
              </select>
              <select
                value={ledgerSortBy}
                onChange={(e) => setLedgerSortBy(e.target.value as any)}
                className="px-3 py-2 text-xs font-bold rounded-xl bg-slate-50 border text-slate-900 dark:text-white dark:bg-slate-800"
              >
                <option value="NAME">ترتيب هجائي بالاسم</option>
                <option value="GRADE">ترتيب بالصف الدراسي</option>
                <option value="STAGE">ترتيب بالمرحلة الدراسية</option>
              </select>
            </div>

            {/* استعراض كتل وجداول الطلاب */}
            <div className="overflow-y-auto flex-1 border rounded-2xl max-h-[50vh]">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 text-slate-400 font-black border-b">
                  <tr>
                    <th className="p-3">اسم الطالب</th>
                    <th className="p-3 text-center">المرحلة</th>
                    <th className="p-3 text-center">الصف الدراسي</th>
                    <th className="p-3 text-center">كود البطاقة (Token)</th>
                    <th className="p-3 text-left">أدوات الفحص</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700 dark:text-slate-300">
                  {ledgerStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all"
                    >
                      <td className="p-3 font-black">{student.name}</td>
                      <td className="p-3 text-center font-bold">
                        {stageLabel[student.stage]}
                      </td>
                      <td className="p-3 text-center font-mono">
                        الصف {student.grade}
                      </td>
                      <td className="p-3 text-center font-mono text-[11px] text-slate-400">
                        {student.qrToken || "غير مصدر كود"}
                      </td>
                      <td className="p-3 text-left">
                        <button
                          disabled={reportLoading}
                          onClick={() => void fetchRealMonthlyReport(student)}
                          className="px-3 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-black rounded-lg text-[11px] transition-all"
                        >
                          احسب التقرير التراكمي اللحظي 📈
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}

      {/* ========================================================== */}
      {/* 🏙️ نافذة مودال: عرض التقرير الشهري التراكمي الحي للطالب المسحوب */}
      {/* ========================================================== */}
      {isStudentReportModalOpen && selectedStudentReport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-3xl max-h-[90vh] overflow-hidden p-6 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col gap-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  ملف التقرير الأكاديمي الرقمي الموحد لنسب حضور الطالب 📊
                </h2>
                <p className="text-xs font-bold text-indigo-600 mt-0.5">
                  الطالب: {selectedStudentReport.student?.name}
                </p>
              </div>
              <button
                onClick={() => {
                  setIsStudentReportModalOpen(false);
                  setIsLedgerModalOpen(true);
                }}
                className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* لوحة أرقام الكفاءة والأداء الشهرية */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border">
              {[
                {
                  label: "الحصص المتوقعة لليوم والشهر",
                  value:
                    selectedStudentReport.summary?.totalExpectedSessions || 0,
                  color: "text-slate-700",
                },
                {
                  label: "إجمالي الأيام (حاضر طبيعي)",
                  value: selectedStudentReport.summary?.totalPresent || 0,
                  color: "text-emerald-600",
                },
                {
                  label: "إجمالي الأيام (متأخر)",
                  value: selectedStudentReport.summary?.totalLate || 0,
                  color: "text-amber-500",
                },
                {
                  label: "إجمالي الأيام (غياب)",
                  value: selectedStudentReport.summary?.totalAbsent || 0,
                  color: "text-rose-600",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="text-center bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100"
                >
                  <span className="text-[10px] font-black text-slate-400 block">
                    {s.label}
                  </span>
                  <span
                    className={`text-xl font-black ${s.color} block mt-0.5`}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            {/* معدل الالتزام والتقييم الكلي */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-md">
              <span className="text-xs font-black">
                معدل التزام ونسبة حضور الطالب الإجمالية لعام 2026:
              </span>
              <span className="text-2xl font-black font-mono tracking-wide">
                {selectedStudentReport.summary?.attendanceRate || "100%"}
              </span>
            </div>

            {/* جدول تفاصيل الحصص المنفردة داخل الشهر */}
            <div className="overflow-y-auto flex-1 border rounded-2xl max-h-[40vh]">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 sticky top-0 font-black text-slate-400 border-b">
                  <tr>
                    <th className="p-2.5">المجموعة والمدرس</th>
                    <th className="p-2.5 text-center">تاريخ الحصة</th>
                    <th className="p-2.5 text-center">توقيت الحصة</th>
                    <th className="p-2.5 text-left">حالة الرصد</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-bold text-slate-600 dark:text-slate-300">
                  {selectedStudentReport.details?.map((record, index) => (
                    <tr key={index} className="hover:bg-slate-50/60">
                      <td className="p-2.5 font-black">
                        <div className="flex flex-col">
                          <span>{record.sessionName}</span>
                          <span className="text-[10px] text-slate-400 font-bold mt-0.5">
                            {record.subject} • أ/{record.teacherName}
                          </span>
                        </div>
                      </td>
                      <td className="p-2.5 text-center font-mono">
                        {record.date
                          ? new Date(record.date).toLocaleDateString("ar-EG")
                          : ""}
                      </td>
                      <td className="p-2.5 text-center font-mono text-[11px] text-slate-400">
                        {record.startTime} - {record.endTime}
                      </td>
                      <td className="p-2.5 text-left">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${record.status === "PRESENT" ? "bg-emerald-50 text-emerald-600" : record.status === "LATE" ? "bg-amber-50 text-amber-600" : "bg-rose-50 text-rose-600"}`}
                        >
                          {record.status === "PRESENT"
                            ? "حاضر"
                            : record.status === "LATE"
                              ? `متأخر (${record.lateMinutes} د)`
                              : "غياب"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
