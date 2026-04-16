import { ValueObject } from '../../../../core/domain/base/value-object.base';
import { Result } from '../../../../core/domain/base/result';

interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  get value(): string {
    return this.props.value;
  }

  private constructor(props: EmailProps) {
    super(props);
  }

  public static create(email: string): Result<Email> {
    if (!email || email.length <= 3) {
      return Result.fail<Email>("Email must be at least 3 characters");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Result.fail<Email>("Invalid email format");
    }

    return Result.ok<Email>(new Email({ value: email.toLowerCase() }));
  }
}
