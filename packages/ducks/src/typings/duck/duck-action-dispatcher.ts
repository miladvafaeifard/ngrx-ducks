import { MemoizedSelector, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { ActionHandlerWithPayload } from './action-handler-with-payload';
import { ActionHandlerWithoutPayload } from './action-handler-without-payload';
import { DispatcherForEffect } from './dispatcher-for-effect';
import { EffectActionCreator } from './effect-action-creator';
import { LoadedAction } from './loaded-action';
import { PlainAction } from './plain-action';
import { ObservableSelectors } from './observable-selectors';

export type DuckActionDispatcher<TMember> = TMember extends DispatcherForEffect
  ? EffectActionCreator<TMember>
  : TMember extends MemoizedSelector<infer _TState, infer TResult>
  ? Observable<TResult>
  : TMember extends (
      store: Store<unknown>
    ) => ObservableSelectors<infer TSelector>
  ? ObservableSelectors<TSelector>
  : TMember extends ActionHandlerWithoutPayload<infer _TSlice>
  ? (() => void) & PlainAction & { type: string }
  : TMember extends ActionHandlerWithPayload<infer _TSlice, infer TPayload>
  ? ((payload: TPayload) => void) & LoadedAction<TPayload> & { type: string }
  : never;