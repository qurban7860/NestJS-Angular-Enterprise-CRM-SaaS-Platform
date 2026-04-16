import { ValueObject } from '../../../../core/domain/base/value-object.base';
import { Result } from '../../../../core/domain/base/result';

interface PasswordProps {
  value: string;
  isHashed: boolean;
}

export class Password extends ValueObject<PasswordProps> {
  get value(): string {
    return this.props.value;
  }

  get isHashed(): boolean {
    return this.props.isHashed;
  }

  private constructor(props: PasswordProps) {
    super(props);
  }

  public static create(password: string): Result<Password> {
    if (!password || password.length < 8) {
      return Result.fail<Password>("Password must be at least 8 characters");
    }
    // Note: Complexity rules can be added here
    return Result.ok<Password>(new Password({ value: password, isHashed: false }));
  }

  public static createHashed(hashedValue: string): Result<Password> {
    return Result.ok<Password>(new Password({ value: hashedValue, isHashed: true }));
  }
}
