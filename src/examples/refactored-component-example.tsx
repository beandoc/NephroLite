/**
 * Example of refactored component using new utilities
 * This demonstrates how to migrate from duplicated patterns to reusable hooks
 */

import { notifications } from '@/lib/notifications';
import { useAsyncData } from '@/hooks/use-async-data';
import { MAX_SEARCH_RESULTS } from '@/lib/constants';

// BEFORE: Duplicated pattern (appears in 15+ components)
/*
const [patient, setPatient] = useState<Patient | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<Error | null>(null);

useEffect(() => {
  getPatientById(patientId)
    .then(data => setPatient(data))
    .catch(err => setError(err))
    .finally(() => setLoading(false));
}, [patientId]);
*/

// AFTER: Using useAsyncData hook ✅
export function ExampleComponent({ patientId }: { patientId: string }) {
    const { data: patient, loading, error, refetch } = useAsyncData(
        () => getPatientById(patientId),
        [patientId]
    );

    // BEFORE: Duplicated toast pattern (50+ occurrences)
    /*
    toast({
      title: "Success",
      description: "Patient updated successfully"
    });
    */

    // AFTER: Using notification helpers ✅
    const handleSave = async () => {
        try {
            await savePatient(patient);
            notifications.patient.updated(patient.name);
            // Or for custom messages:
            // notifications.success("Custom success message");
        } catch (error) {
            notifications.error("Failed to save patient");
        }
    };

    // BEFORE: Magic numbers
    // .slice(0, 5)

    // AFTER: Named constants ✅
    const searchResults = allResults.slice(0, MAX_SEARCH_RESULTS);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!patient) return <div>Not found</div>;

    return (
        <div>
            <h1>{patient.name}</h1>
            {/* Component UI */}
        </div>
    );
}

// Mock function for example
declare function getPatientById(id: string): Promise<any>;
declare function savePatient(patient: any): Promise<void>;
const allResults: any[] = [];
