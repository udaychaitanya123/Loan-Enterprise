import { Injectable } from '@angular/core';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { DynamicFieldDefinition, FormSchema, ConditionalLogic, ValidatorDef } from '../models';

type FieldMeta = {
  baseRequired: boolean;
  baseValidators: ValidatorFn[];
  field: DynamicFieldDefinition;
};

@Injectable({ providedIn: 'root' })
export class DynamicFormService {
  private readonly metaByForm = new WeakMap<FormGroup, Map<string, FieldMeta>>();

  buildFormGroup(schema: FormSchema): FormGroup {
    const controls: Record<string, FormControl> = {};
    const meta = new Map<string, FieldMeta>();

    for (const step of schema.steps) {
      for (const field of step.fields) {
        const baseValidators = this.buildBaseValidators(field);
        meta.set(field.key, {
          baseRequired: field.required,
          baseValidators,
          field
        });

        const initial =
          field.defaultValue !== undefined ? field.defaultValue : field.type === 'checkbox' ? false : null;

        controls[field.key] = new FormControl(initial, baseValidators);
      }
    }

    const group = new FormGroup(controls);
    this.metaByForm.set(group, meta);

    // Apply initial conditional visibility/requirement.
    this.applyConditionalLogic(schema, group);
    return group;
  }

  applyConditionalLogic(schema: FormSchema, group: FormGroup): void {
    const meta = this.metaByForm.get(group);
    if (!meta) return;

    for (const step of schema.steps) {
      for (const field of step.fields) {
        const control = group.get(field.key);
        if (!control) continue;

        const fieldMeta = meta.get(field.key);
        if (!fieldMeta) continue;

        let conditionalRequired = false;
        let shouldDisable = false;

        const conditionalLogic = field.conditionalLogic ?? [];
        for (const logic of conditionalLogic) {
          const dependsControlValue = group.get(logic.dependsOn)?.value;
          const conditionMatches = this.evaluateCondition(dependsControlValue, logic);

          switch (logic.action) {
            case 'show':
              shouldDisable = !conditionMatches;
              break;
            case 'hide':
              shouldDisable = conditionMatches;
              break;
            case 'disable':
              shouldDisable = conditionMatches;
              break;
            case 'require':
              conditionalRequired = conditionMatches;
              break;
          }
        }

        if (shouldDisable) {
          // Disabled fields are not part of the validated submission payload.
          control.disable({ emitEvent: false });
          control.setValue(null, { emitEvent: false });
        } else {
          control.enable({ emitEvent: false });
        }

        // Update required validator if needed.
        const validators = this.buildValidatorsForCurrentCondition(fieldMeta, conditionalRequired);
        control.setValidators(validators);
        control.updateValueAndValidity({ emitEvent: false });
      }
    }
  }

  serializeFormGroup(group: FormGroup): Record<string, unknown> {
    // Disabled controls are excluded by design.
    const raw = group.getRawValue();
    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(raw)) {
      result[key] = value;
    }
    return result;
  }

  private buildBaseValidators(field: DynamicFieldDefinition): ValidatorFn[] {
    const validators: ValidatorFn[] = [];
    if (field.required) validators.push(Validators.required);
    for (const v of field.validators ?? []) {
      this.addValidator(validators, v);
    }
    return validators;
  }

  private addValidator(validators: ValidatorFn[], def: ValidatorDef): void {
    switch (def.type) {
      case 'email':
        validators.push(Validators.email);
        break;
      case 'min':
        if (def.value === undefined) return;
        validators.push(Validators.min(def.value));
        break;
      case 'max':
        if (def.value === undefined) return;
        validators.push(Validators.max(def.value));
        break;
    }
  }

  private buildValidatorsForCurrentCondition(fieldMeta: FieldMeta, conditionalRequired: boolean): ValidatorFn[] {
    const validators = [...fieldMeta.baseValidators];
    if (!fieldMeta.baseRequired && conditionalRequired) {
      validators.push(Validators.required);
    }
    // If baseRequired is true, Validators.required already exists in baseValidators.
    // If baseRequired is false, conditionalRequired=false means we don't add required.
    return validators;
  }

  private evaluateCondition(actual: unknown, logic: ConditionalLogic): boolean {
    const expected = logic.value;

    switch (logic.operator) {
      case 'eq':
        return actual === expected;
      case 'neq':
        return actual !== expected;
      case 'gt': {
        const a = typeof actual === 'number' ? actual : Number(actual);
        const b = typeof expected === 'number' ? expected : Number(expected);
        return a > b;
      }
      case 'lt': {
        const a = typeof actual === 'number' ? actual : Number(actual);
        const b = typeof expected === 'number' ? expected : Number(expected);
        return a < b;
      }
      case 'contains':
        return `${actual ?? ''}`.includes(`${expected ?? ''}`);
    }
  }
}

