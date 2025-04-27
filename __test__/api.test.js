const request = require('supertest');
const express = require('express');
const app = express();

// Mount your real routes
require('../routes')(app);

// Mock your storage and external API if needed
jest.mock('../db/storage');
jest.mock('../externalData');

// Import mocked modules
const storage = require('../db/storage');
const externalData = require('../externalData');

describe('API Endpoints', () => {
  
  describe('POST /api/addMenu', () => {
    it('should store menu and return success response', async () => {
      storage.set.mockResolvedValue(); // simulate successful storage
      
      const payload = {
        menus: [
          {
            id: 1,
            sysName: 'King menu',
            name: { 'en-GB': 'King menu', 'fr-FR': 'Le menu de roi' },
            price: 2.3,
            vatRate: 'normal'
          }
        ],
        vatRates: {
          normal: { ratePct: 20, isDefault: true }
        }
      };

      const response = await request(app)
        .post('/api/addMenu')
        .send(payload)
        .set('Accept', 'application/json');
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ status: 'stored', key: 'MENU' });
      expect(storage.set).toHaveBeenCalled();
    });

    it('should return 400 for invalid payload', async () => {
      const invalidPayload = { foo: 'bar' }; // missing required fields

      const response = await request(app)
        .post('/api/addMenu')
        .send(invalidPayload)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400); // because of validation middleware
    });
  });

  describe('GET /api/getMenu', () => {
    it('should return merged menu data', async () => {
      storage.get.mockResolvedValue({ menus: [{ id: 1, sysName: 'Menu1' }], vatRates: {} });
      externalData.fetchExternalDataWithCache.mockResolvedValue({ extraField: 'external' });

      const response = await request(app).get('/api/getMenu');

      expect(response.status).toBe(200);
      expect(response.body.menus).toBeDefined();
      expect(response.body.extraField).toBe('external');
      expect(storage.get).toHaveBeenCalled();
      expect(externalData.fetchExternalDataWithCache).toHaveBeenCalled();
    });

    it('should return 404 if menu not found', async () => {
      storage.get.mockResolvedValue(null); // simulate no menu found

      const response = await request(app).get('/api/getMenu');

      expect(response.status).toBe(404);
      expect(response.text).toContain('err_menu_not_found');
    });

    it('should return 503 if external data not found', async () => {
      storage.get.mockResolvedValue({ menus: [{ id: 1, sysName: 'Menu1' }], vatRates: {} });      
      externalData.fetchExternalDataWithCache.mockResolvedValue(null);

      const response = await request(app).get('/api/getMenu');

      expect(response.status).toBe(503);
      expect(response.text).toContain('err_external_data_not_found');
    });

  });

});
