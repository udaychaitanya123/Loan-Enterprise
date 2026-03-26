import { CommonModule, NgFor, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import { Component, Input, computed } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DynamicFieldDefinition } from '../../core/models';

function findValidatorMessage(
  field: DynamicFieldDefinition,
  type: 'email' | 'min' | 'max'
): string | undefined {
  return field.validators?.find((v) => v.type === type)?.message;
}

@Component({
  selector: 'app-dynamic-field',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, NgSwitch, NgSwitchCase, ReactiveFormsModule],
  template: `
    <div class="space-y-2" *ngIf="!disabled()" [formGroup]="formGroup">
      <label
        class="block text-sm font-medium text-jet_black-500"
        [attr.for]="controlId()"
        *ngIf="field.type !== 'checkbox'"
      >
        {{ field.label }}
      </label>

      <ng-container [ngSwitch]="field.type">
        <input
          *ngSwitchCase="'text'"
          class="
            h-12 w-full rounded-xl
            border border-silver-700 bg-transparent
            px-4 font-body text-jet_black-500
            placeholder:text-blue_slate-600/50
            focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
            transition-all duration-200
          "
          [id]="controlId()"
          [formControlName]="field.key"
          [attr.aria-describedby]="errorId()"
          [readOnly]="readOnly"
          [class.bg-silver-900]="readOnly"
        />

        <textarea
          *ngSwitchCase="'textarea'"
          class="
            min-h-[110px] w-full rounded-xl
            border border-silver-700 bg-transparent
            px-4 py-3 font-body text-jet_black-500
            placeholder:text-blue_slate-600/50
            focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
            transition-all duration-200
          "
          [id]="controlId()"
          [formControlName]="field.key"
          [attr.aria-describedby]="errorId()"
          [readOnly]="readOnly"
          [class.bg-silver-900]="readOnly"
        ></textarea>

        <input
          *ngSwitchCase="'date'"
          class="
            h-12 w-full rounded-xl
            border border-silver-700 bg-transparent
            px-4 font-body text-jet_black-500
            focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
            transition-all duration-200
          "
          [id]="controlId()"
          type="date"
          [formControlName]="field.key"
          [attr.aria-describedby]="errorId()"
          [readOnly]="readOnly"
          [class.bg-silver-900]="readOnly"
        />

        <input
          *ngSwitchCase="'email'"
          class="
            h-12 w-full rounded-xl
            border border-silver-700 bg-transparent
            px-4 font-body text-jet_black-500
            placeholder:text-blue_slate-600/50
            focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
            transition-all duration-200
          "
          [id]="controlId()"
          type="email"
          [formControlName]="field.key"
          [attr.aria-describedby]="errorId()"
          [readOnly]="readOnly"
          [class.bg-silver-900]="readOnly"
        />

        <input
          *ngSwitchCase="'currency'"
          class="
            h-12 w-full rounded-xl
            border border-silver-700 bg-transparent
            px-4 font-body text-jet_black-500
            placeholder:text-blue_slate-600/50
            focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
            transition-all duration-200
          "
          [id]="controlId()"
          type="number"
          step="0.01"
          [formControlName]="field.key"
          [attr.aria-describedby]="errorId()"
          [readOnly]="readOnly"
          [class.bg-silver-900]="readOnly"
        />

        <select
          *ngSwitchCase="'dropdown'"
          class="
            h-12 w-full rounded-xl
            border border-silver-700 bg-white
            px-4 font-body text-jet_black-500
            focus:outline-none focus:ring-2 focus:ring-coral_glow-500 focus:ring-offset-2
            transition-all duration-200
          "
          [id]="controlId()"
          [formControlName]="field.key"
          [attr.aria-describedby]="errorId()"
          [disabled]="readOnly"
          [class.bg-silver-900]="readOnly"
        >
          <option [ngValue]="null">Select...</option>
          <option *ngFor="let opt of field.options ?? []" [ngValue]="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <div class="flex flex-wrap gap-3" *ngSwitchCase="'radio'">
          <label
            class="inline-flex items-center gap-2 rounded-xl border border-silver-700 bg-white px-4 py-3 text-sm text-jet_black-500 hover:bg-silver-900 transition-colors"
            *ngFor="let opt of field.options ?? []"
            [class.opacity-70]="readOnly"
            [class.cursor-not-allowed]="readOnly"
          >
            <input
              type="radio"
              [value]="opt.value"
              [formControlName]="field.key"
              [disabled]="readOnly"
              [attr.aria-describedby]="errorId()"
            />
            {{ opt.label }}
          </label>
        </div>

        <label
          class="inline-flex items-center gap-3 rounded-xl border border-silver-700 bg-white px-4 py-3 text-sm text-jet_black-500 hover:bg-silver-900 transition-colors"
          *ngSwitchCase="'checkbox'"
          [class.opacity-70]="readOnly"
          [class.cursor-not-allowed]="readOnly"
        >
          <input
            type="checkbox"
            [formControlName]="field.key"
            [disabled]="readOnly"
            [attr.aria-describedby]="errorId()"
          />
          <span>{{ field.label }}</span>
        </label>
      </ng-container>

      <div
        *ngIf="messages().length > 0"
        [id]="errorId()"
        role="alert"
        aria-live="polite"
        class="rounded-xl border border-coral_glow-500/30 bg-coral_glow-500/5 px-4 py-3 text-sm text-jet_black-500"
      >
        <div class="space-y-1">
          <div *ngFor="let m of messages()">{{ m }}</div>
        </div>
      </div>
    </div>

    <!-- Intentionally hide disabled fields even in readOnly mode. -->
  `,
})
export class DynamicFieldComponent {
  @Input({ required: true }) field!: DynamicFieldDefinition;
  @Input({ required: true }) formGroup!: FormGroup;
  @Input() readOnly = false;

  private readonly controlIdValue = computed(() => `field-${this.field.key}`);
  private readonly errorIdValue = computed(() => `err-${this.field.key}`);
  private readonly isDisabledValue = computed(() => this.formGroup.get(this.field.key)?.disabled ?? false);
  private readonly valueAsStringValue = computed(() => {
    const v = this.formGroup.get(this.field.key)?.value;
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    return JSON.stringify(v);
  });

  controlId(): string {
    return this.controlIdValue();
  }

  errorId(): string {
    return this.errorIdValue();
  }

  disabled(): boolean {
    return this.isDisabledValue();
  }

  valueAsString(): string {
    return this.valueAsStringValue();
  }

  messages(): string[] {
    const control = this.formGroup.get(this.field.key);
    if (!control) return [];
    if (!(control.invalid && (control.touched || control.dirty))) return [];

    const messages: string[] = [];
    if (control.errors?.['required']) {
      messages.push(`${this.field.label} is required.`);
    }
    if (control.errors?.['email']) {
      messages.push(findValidatorMessage(this.field, 'email') ?? `${this.field.label} must be a valid email.`);
    }
    if (control.errors?.['min']) {
      messages.push(findValidatorMessage(this.field, 'min') ?? `${this.field.label} is below the minimum value.`);
    }
    if (control.errors?.['max']) {
      messages.push(findValidatorMessage(this.field, 'max') ?? `${this.field.label} exceeds the maximum value.`);
    }
    return messages;
  }
}

