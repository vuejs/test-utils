import { shallowMount } from '../src';
import { useRoute } from 'vue-router';

import Issue584Async from './components/issue584-async.vue';
import Issue584Sync from './components/issue584-sync.vue';

const mockedUseRoute = useRoute as jest.Mock;
jest.mock('vue-router');

describe("ISSUE584", () => {
  describe('Issue584Sync.vue', () => {
    it('should throw a type error setup ASYNC', async () => {
      mockedUseRoute.mockReturnValueOnce({
        params: {
          id: '/monid',
        },
      });

      const wrapper = shallowMount(Issue584Async, {
        global: {
          mocks: {
            $router: {
              back: jest.fn(),
            },
          },
        },
      });
    });
  });

  describe('Issue584Async.vue', () => {
    it('should throw a type error setup SYNC', async () => {
      mockedUseRoute.mockReturnValueOnce({
        params: {
          id: '/monid',
        },
      });

      const wrapper = shallowMount(Issue584Sync, {
        global: {
          mocks: {
            $router: {
              back: jest.fn(),
            },
          },
        },
      });
    });
  });

});
