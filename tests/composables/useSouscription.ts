import { reactive, ref, unref } from 'vue';

// Because we don't know exactly what its return "any"
// eslint-disable-next-line
export function useSouscription(): any {
  const souscription = ref();

  async function fetchSouscription(uuid: string): Promise<void> {
    try {
      souscription.value = await Promise.resolve({
        reference: "TEST-REFERENCE"
      });
    } catch (e) {
      console.error('Unable to fetch Souscriptions', e);
    }
  }

  return {
    fetchSouscription,
    souscription,
  };
}
