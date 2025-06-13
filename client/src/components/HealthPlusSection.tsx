import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Pill, 
  Plus, 
  Bell, 
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  TrendingUp,
  Heart,
  Thermometer,
  Activity,
  Brain,
  Droplets,
  Moon
} from "lucide-react";
import { format, addHours, isAfter, parseISO } from "date-fns";

interface Medication {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  reminderTimes: string[];
  isActive: boolean;
  nextDose: string;
  lastTaken: string | null;
  createdAt: string;
}

interface HealthMetric {
  id: number;
  date: string;
  sleepQuality: number;
  energyLevel: number;
  stressLevel: number;
  symptoms: string[];
  medicationsTaken: string[];
  periodFlow: string;
  periodSymptoms: string[];
  notes: string;
}

interface HealthPlusSectionProps {
  selectedDate: Date;
  isReadOnly?: boolean;
}

export default function HealthPlusSection({ selectedDate, isReadOnly = false }: HealthPlusSectionProps) {
  const queryClient = useQueryClient();
  
  // Local state for medications management
  const [medications, setMedications] = useState<Medication[]>([]);

  // Mutation for creating medications
  const createMedicationMutation = useMutation({
    mutationFn: async (medicationData: any) => {
      return await apiRequest('/api/medications', 'POST', medicationData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/medications'] });
    }
  });

  const [todaysHealth, setTodaysHealth] = useState<HealthMetric>({
    id: 1,
    date: format(selectedDate, 'yyyy-MM-dd'),
    sleepQuality: 4,
    energyLevel: 3,
    stressLevel: 2,
    symptoms: [],
    medicationsTaken: ["Vitamin D3"],
    periodFlow: "none",
    periodSymptoms: [],
    notes: ""
  });

  const [showMedDialog, setShowMedDialog] = useState(false);
  const [newMedication, setNewMedication] = useState({
    name: "",
    dosage: "",
    frequency: "daily",
    reminderTimes: ["08:00"]
  });

  const commonSymptoms = [
    { value: "headache", label: "Headache", icon: "🤕" },
    { value: "fatigue", label: "Fatigue", icon: "😴" },
    { value: "nausea", label: "Nausea", icon: "🤢" },
    { value: "fever", label: "Fever", icon: "🌡️" },
    { value: "cough", label: "Cough", icon: "😷" },
    { value: "sore_throat", label: "Sore Throat", icon: "🗣️" },
    { value: "muscle_ache", label: "Muscle Ache", icon: "💪" },
    { value: "stomach_ache", label: "Stomach Ache", icon: "🫃" }
  ];

  const periodSymptoms = [
    { value: "cramps", label: "Cramps", icon: "😣" },
    { value: "bloating", label: "Bloating", icon: "🫄" },
    { value: "mood_swings", label: "Mood Swings", icon: "😤" },
    { value: "breast_tenderness", label: "Breast Tenderness", icon: "🤱" },
    { value: "back_pain", label: "Back Pain", icon: "🦴" },
    { value: "acne", label: "Acne", icon: "😔" }
  ];

  const frequencies = [
    { value: "daily", label: "Daily" },
    { value: "twice_daily", label: "Twice Daily" },
    { value: "three_times_daily", label: "Three Times Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "as_needed", label: "As Needed" }
  ];

  const upcomingReminders = medications
    .filter(med => med.isActive && med.nextDose)
    .sort((a, b) => new Date(a.nextDose).getTime() - new Date(b.nextDose).getTime())
    .slice(0, 3);

  const overdueMedications = medications.filter(med => 
    med.isActive && med.nextDose && isAfter(new Date(), parseISO(med.nextDose))
  );

  const createMedication = () => {
    if (!newMedication.name || !newMedication.dosage) return;

    const medication: Medication = {
      id: Date.now(),
      ...newMedication,
      isActive: true,
      nextDose: format(addHours(new Date(), 1), 'yyyy-MM-dd\'T\'HH:mm:ss'),
      lastTaken: null,
      createdAt: format(new Date(), 'yyyy-MM-dd')
    };

    createMedicationMutation.mutate(medication);
    setNewMedication({
      name: "",
      dosage: "",
      frequency: "daily",
      reminderTimes: ["08:00"]
    });
    setShowMedDialog(false);
  };

  const markMedicationTaken = (medId: number) => {
    const now = new Date();
    // In a full implementation, this would update via API
    console.log('Medication marked as taken:', medId);
    
    setMedications(medications.map(med => {
      if (med.id === medId) {
        let nextDose = new Date();
        switch (med.frequency) {
          case "daily":
            nextDose = addHours(nextDose, 24);
            break;
          case "twice_daily":
            nextDose = addHours(nextDose, 12);
            break;
          case "three_times_daily":
            nextDose = addHours(nextDose, 8);
            break;
          case "weekly":
            nextDose = addHours(nextDose, 168);
            break;
          default:
            nextDose = addHours(nextDose, 24);
        }

        return {
          ...med,
          lastTaken: now.toISOString(),
          nextDose: nextDose.toISOString()
        };
      }
      return med;
    }));

    // Add to today's taken medications
    if (!todaysHealth.medicationsTaken.includes(medications.find(m => m.id === medId)?.name || "")) {
      setTodaysHealth({
        ...todaysHealth,
        medicationsTaken: [...todaysHealth.medicationsTaken, medications.find(m => m.id === medId)?.name || ""]
      });
    }
  };

  const toggleSymptom = (symptom: string) => {
    const newSymptoms = todaysHealth.symptoms.includes(symptom)
      ? todaysHealth.symptoms.filter(s => s !== symptom)
      : [...todaysHealth.symptoms, symptom];
    
    setTodaysHealth({ ...todaysHealth, symptoms: newSymptoms });
  };

  const togglePeriodSymptom = (symptom: string) => {
    const newSymptoms = todaysHealth.periodSymptoms.includes(symptom)
      ? todaysHealth.periodSymptoms.filter(s => s !== symptom)
      : [...todaysHealth.periodSymptoms, symptom];
    
    setTodaysHealth({ ...todaysHealth, periodSymptoms: newSymptoms });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-heading font-bold bg-gradient-to-r from-pink-600 to-purple-600 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
            Health+ & Medication Tracking
          </h3>
          <p className="text-muted-foreground dark:text-gray-300 mt-1">
            Comprehensive health monitoring and medication management
          </p>
        </div>
        
        <Dialog open={showMedDialog} onOpenChange={!isReadOnly ? setShowMedDialog : undefined}>
          <DialogTrigger asChild>
            <Button 
              disabled={isReadOnly}
              className={`bg-gradient-to-r from-pink-400 to-purple-500 hover:from-pink-500 hover:to-purple-600 text-white font-medium rounded-xl shadow-lg ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-gray-900 border-0 rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-900 dark:text-white">Add New Medication</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="medName">Medication Name</Label>
                <Input
                  id="medName"
                  value={newMedication.name}
                  onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  placeholder="e.g., Vitamin D3"
                  className="dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <Input
                  id="dosage"
                  value={newMedication.dosage}
                  onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  placeholder="e.g., 2000 IU, 500mg"
                  className="dark:bg-gray-800 dark:text-white"
                />
              </div>
              
              <div>
                <Label>Frequency</Label>
                <Select value={newMedication.frequency} onValueChange={(value) => setNewMedication({ ...newMedication, frequency: value })}>
                  <SelectTrigger className="dark:bg-gray-800 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencies.map(freq => (
                      <SelectItem key={freq.value} value={freq.value}>{freq.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <Button 
                onClick={!isReadOnly ? createMedication : undefined} 
                disabled={isReadOnly}
                className={`w-full bg-gradient-to-r from-pink-400 to-purple-500 text-white ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Add Medication
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Urgent Alerts */}
      {overdueMedications.length > 0 && (
        <Card className="bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg border-0 rounded-2xl">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6" />
              <div>
                <h4 className="font-semibold">Overdue Medications</h4>
                <p className="text-red-100">
                  {overdueMedications.length} medication{overdueMedications.length > 1 ? 's' : ''} overdue
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Health Tracking */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Activity className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              <span>Today's Health Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sleep Quality */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Sleep Quality (1-5)
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Moon className="h-4 w-4 text-purple-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Quality: {todaysHealth.sleepQuality}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={todaysHealth.sleepQuality}
                  onChange={(e) => setTodaysHealth({ ...todaysHealth, sleepQuality: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Energy Level (1-5)
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Energy: {todaysHealth.energyLevel}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={todaysHealth.energyLevel}
                  onChange={(e) => setTodaysHealth({ ...todaysHealth, energyLevel: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Stress Level */}
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Stress Level (1-5)
              </Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Brain className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Stress: {todaysHealth.stressLevel}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={todaysHealth.stressLevel}
                  onChange={(e) => setTodaysHealth({ ...todaysHealth, stressLevel: Number(e.target.value) })}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Symptom Tracking */}
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Thermometer className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              <span>Symptom Tracking</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                  Any symptoms today?
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  {commonSymptoms.map(symptom => (
                    <button
                      key={symptom.value}
                      onClick={() => toggleSymptom(symptom.value)}
                      className={`p-3 rounded-lg text-center transition-all duration-200 text-sm ${
                        todaysHealth.symptoms.includes(symptom.value)
                          ? 'bg-gradient-to-r from-red-400 to-pink-400 text-white shadow-lg'
                          : 'bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="text-lg mb-1">{symptom.icon}</div>
                      <div className="text-xs font-medium">{symptom.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Period Tracking */}
      <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
            <Droplets className="h-5 w-5 text-pink-600 dark:text-pink-400" />
            <span>Period Tracking</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Flow Level
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {["none", "light", "medium", "heavy"].map(flow => (
                  <button
                    key={flow}
                    onClick={() => setTodaysHealth({ ...todaysHealth, periodFlow: flow })}
                    className={`p-3 rounded-lg text-center transition-all duration-200 capitalize ${
                      todaysHealth.periodFlow === flow
                        ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-lg'
                        : 'bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700'
                    }`}
                  >
                    {flow}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                Period Symptoms
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {periodSymptoms.map(symptom => (
                  <button
                    key={symptom.value}
                    onClick={() => togglePeriodSymptom(symptom.value)}
                    className={`p-2 rounded-lg text-center transition-all duration-200 text-xs ${
                      todaysHealth.periodSymptoms.includes(symptom.value)
                        ? 'bg-gradient-to-r from-pink-400 to-purple-500 text-white shadow-lg'
                        : 'bg-white/60 dark:bg-gray-800/60 hover:bg-white dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className="text-sm mb-1">{symptom.icon}</div>
                    <div className="font-medium">{symptom.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medication Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Bell className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              <span>Upcoming Reminders</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingReminders.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No upcoming medication reminders
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingReminders.map(med => (
                  <div key={med.id} className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{med.name}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{med.dosage}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Next: {format(parseISO(med.nextDose), 'HH:mm')}
                        </p>
                      </div>
                      <Button
                        onClick={() => markMedicationTaken(med.id)}
                        size="sm"
                        className="bg-gradient-to-r from-green-400 to-emerald-400 text-white"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-900 dark:text-white">
              <Pill className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              <span>All Medications ({medications.filter(m => m.isActive).length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {medications.filter(m => m.isActive).length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No medications added yet
              </div>
            ) : (
              <div className="space-y-3">
                {medications.filter(m => m.isActive).map(med => (
                  <div key={med.id} className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-3 backdrop-blur-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900 dark:text-white">{med.name}</h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{med.dosage}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {med.frequency.replace('_', ' ')}
                          </Badge>
                          {med.lastTaken && (
                            <span className="text-xs text-green-600 dark:text-green-400">
                              Last: {format(parseISO(med.lastTaken), 'MMM d, HH:mm')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}