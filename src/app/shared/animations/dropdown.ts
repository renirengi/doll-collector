import { trigger, transition, style, animate } from '@angular/animations';

export const dropdownAnimation = trigger('dropdown', [
  transition(':enter', [
    style({
      height: '0',
      opacity: 0,
      overflow: 'hidden',
      marginTop: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    animate(
      '300ms cubic-bezier(0.4, 0.0, 0.2, 1)',
      style({
        height: '*',
        opacity: 1,
        marginTop: '*',
        marginBottom: '*',
        paddingTop: '*',
        paddingBottom: '*',
      }),
    ),
  ]),
  transition(':leave', [
    style({ height: '*', overflow: 'hidden' }),
    animate(
      '200ms cubic-bezier(0.4, 0.0, 1, 1)',
      style({
        height: '0',
        opacity: 0,
        marginTop: 0,
        marginBottom: 0,
        paddingTop: 0,
        paddingBottom: 0,
      }),
    ),
  ]),
]);
