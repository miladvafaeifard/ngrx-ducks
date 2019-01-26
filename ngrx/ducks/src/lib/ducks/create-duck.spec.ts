import {
  validActionType,
  WithoutActionDecorator,
  WithProperty,
  WithValidActionType
} from '../../../test/mocks';
import { WiredActions } from '../core/types';
import { MissingActionDecoratorError, throwIf } from '../errors';

describe('createDucks', () => {
  describe('When a single action type is provided', () => {
    it('should create a single wired action', () => {
      const duck = createDuck(WithValidActionType);
      expect(duck.increase(1)).toEqual({
        type: validActionType,
        payload: 1
      });
    });
  });

  describe('When no action type is given', () => {
    describe('When one method is not decorated with @Action', () => {
      it('should raise an error', () => {
        const error = new MissingActionDecoratorError(
          WithoutActionDecorator.name,
          'increase'
        );

        expect(() => createDuck(WithoutActionDecorator)).toThrowError(error);
      });
    });

    describe('When the class contains properties', () => {
      it('should preserve them', () => {
        const withProperty = new WithProperty();
        const duck = createDuck(WithProperty);

        expect(duck.name).toBe(withProperty.name);
      });
    });
  });
});

export function createDuck<T extends new () => InstanceType<T>>(
  classToken: T
): WiredActions<InstanceType<T>> {
  const origin = new classToken();
  const target = { ...origin };

  methodsFrom<T>(classToken).forEach(
    method => (target[method] = wireUpAction(origin, method))
  );

  return target;
}

function methodsFrom<T extends new () => InstanceType<T>>(classToken: T) {
  return Object.getOwnPropertyNames(classToken.prototype).filter(
    omitConstructor
  );
}

function wireUpAction<T>(instance: T, method: string) {
  throwIf(
    !instance[method].wiredAction,
    new MissingActionDecoratorError(instance.constructor.name, method)
  );

  const type = instance[method].wiredAction.type;

  const wiredAction: any = (payload: any) => ({
    type,
    payload
  });

  wiredAction.type = type;
  wiredAction.caseReducer = instance[method].wiredAction.caseReducer;

  return wiredAction;
}

function omitConstructor(member: string): boolean {
  return member !== 'constructor';
}