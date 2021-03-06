import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Request } from '../helpers/request.helpers';
import { GenerateUser, GenerateBadUser } from '../fixtures/user.fixtures';
import { GeneratePhoto, GenerateBadPhoto } from '../fixtures/photo.fixtures';

import { AppModule } from '../../src/app/app.module';
import { AuthService } from '../../src/modules/auth/auth.service';

describe('', () => {
  let app: INestApplication;
  let authService: AuthService;
  let request: Request;

  let generateUser = new GenerateUser();
  let generateBadUser = new GenerateBadUser();

  let generatePhotos = GeneratePhoto;
  let generateBadPhotos = new GenerateBadPhoto();

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication().useGlobalPipes(new ValidationPipe());
    authService = module.get<AuthService>(AuthService);
    request = new Request(app);

    return await app.init();
  });

  describe('User flow (api/user):', () => {
    describe('[POST]: Create', () => {
      it('[201]: Create', async () => {
        const { body } = await request.post('/user', 201, generateUser);
        return await request.setPasport(authService.signIn(body));
      });

      it('[400]: Bad-Request', async () => {
        return await request.post('/user', 400, generateBadUser);
      });

      it('[409]: Conflict', async () => {
        return await request.post('/user', 409, generateUser);
      });
    });

    describe('[Get]: Reflection', () => {
      it('[401]: Unauthorized', async () => {
        return await request.get('/user', 401);
      });

      it('[200]: OK', async () => {
        return await request.getAuth('/user', 200);
      });
    });

    describe('[Patch]: Update', () => {
      it('[401]: Unauthorized', async () => {
        return await request.patch('/user', 401, generateUser);
      });

      it('[400]: Bad-Request', async () => {
        return await request.patchAuth('/user', 400, generateBadUser);
      });

      it('[200]: OK', async () => {
        const { body } = await request.patchAuth(
          '/user',
          200,
          new GenerateUser(),
        );
        generateUser = body;
        return await request.setPasport(authService.signIn(body));
      });
    });

    describe('[Delete]: Delete', () => {
      it('[401]: Unauthorized', async () => {
        return await request.delete('/user', 401);
      });

      it('[200]: OK', async () => {
        return await request.deleteAuth('/user', 200);
      });
    });
  });

  describe('Auth flow (api/auth):', () => {
    describe('[POST]: Create', () => {
      it('[401]: Unauthorized', async () => {
        return await request.post('/auth', 401, new GenerateUser());
      });

      it('[400]: Bad-Request', async () => {
        return await request.post('/auth', 400, generateBadUser);
      });

      it('[201]: Create', async () => {
        const { body } = await request.post('/auth', 201, generateUser);
        return await request.setPasport(body);
      });
    });

    describe('[Patch]: Update', () => {
      it('[401]: Unauthorized', async () => {
        return await request.patch('/auth', 401);
      });

      it('[200]: Create', async () => {
        const { body } = await request.patchAuth('/auth', 200);
        return await request.setPasport(body);
      });
    });
  });

  describe('Photo flow (api/photo):', () => {
    describe('[POST]: Create', () => {
      it('[401]: Unauthorized', async () => {
        return await request.post('/photo', 401, generatePhotos);
      });

      it('[400]: Bad-Request', async () => {
        return await request.postAuth('/photo', 400, generateBadPhotos);
      });

      it('[201]: Create', async () => {
        await generatePhotos.map(async (item) => {
          return await request.postAuth('/photo', 201, item);
        });
      });
    });

    describe('[Get]: Reflection many', () => {
      it('[200]: OK', async () => {
        return await request.getAuth('/photo', 200);
      });
    });

    describe('[Get]: Reflection one', () => {
      it('[401]: Unauthorized', async () => {
        return await request.get('/photo/1', 401);
      });

      it('[404]: Not Found', async () => {
        return await request.getAuth('/photo/16', 404);
      });

      it('[200]: OK', async () => {
        return await request.getAuth('/photo/1', 200);
      });
    });
  });

  describe('Like flow (api/like):', () => {
    describe('[POST]: Create', () => {
      it('[404]: Not Found', async () => {
        return await request.post('/like', 404);
      });

      it('[401]: Unauthorized', async () => {
        return await request.post('/like/1', 401);
      });

      it('[201]: Create 1-like', async () => {
        return await request.postAuth('/like/1', 201);
      });

      it('[201]: Create 2-like', async () => {
        return await request.postAuth('/like/2', 201);
      });

      it('[201]: Cancel 1-like', async () => {
        return await request.postAuth('/like/1', 201);
      });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
