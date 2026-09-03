/**
 * @g3/ui — componentes base React do design system G3.
 * Encapsulam a lib visual (Tailwind + tokens) para manter as telas trocáveis.
 * Requer o preset `g3Preset` de @g3/design-tokens no Tailwind do app.
 */
export { cn } from './cn';
export {
  Button,
  buttonClasses,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
} from './button';
export { Badge, type BadgeProps, type BadgeVariant } from './badge';
export { ProgressBar, type ProgressBarProps } from './progress-bar';
export { Field, type FieldProps } from './field';
export { PasswordField, type PasswordFieldProps } from './password-field';
export { CourseCard, type CourseCardProps } from './course-card';
