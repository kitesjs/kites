# Chào bạn,

Kites.js là một Framework có khả năng tự thân lắp ráp các phần mở rộng extensions để tạo thành một ứng dụng cụ thể.

Với những dự án lớn, code nhiều, DI là thứ rất cần thiết để đảm bảo code dễ bảo trì, dễ nâng cấp. Do đó, Kites.js trang bị một **DI System** để làm cho việc sử dụng và khởi tạo các sự phụ thuộc một cách đơn giản.

Bài này cố gắng giải thích DI System là gì và được sử dụng trong Kites.js như thế nào.

Full mã nguồn ví dụ, bạn có thể tải về tại đây: 
* https://github.com/kitesjs/demo-rest-api-server

# 1. Dependency Injection

Cho những bạn mới chưa biết, thì DI là viết tắt của **Dependency Injection**.
 
Theo [Wikipedia](https://en.wikipedia.org/wiki/Dependency_injection), và mình dịch lại đại ý như thế này:

> **Dependency injection** là một kỹ thuật cho phép một đối tượng có thể cung cấp các **phụ thuộc** của một đối tượng khác. Một **phụ thuộc** là một đối tượng có giá trị sử dụng (ví dụ: nó có thể là một hằng số hoặc một Service nào đó, chẳng hạn TodoService).

**Sự phụ thuộc** là một quan hệ phụ thuộc nhau, như hình dưới đây thì A đang phụ thuộc vào B, lý do A cần sử dụng một vài phương thức của B.

![Dependency](../assets/images/tutorials/dependency.png) 

Như vậy, **phụ thuộc** có nghĩa trông cậy vào một sự hỗ trợ, trợ giúp nào đó. Việc chuyển nhiệm vụ khởi tạo các phụ thuộc cho đơn vị khác và trực tiếp sử dụng biến phụ thuộc đó được gọi là dependency injection.

Ở bài số [#2](https://nodejs.vn/topic/2045/kites-js-2), trong đoạn mã nguồn định nghĩa `TodoController`, thì controller này đang phụ thuộc vào `TodoService`. Bạn có thể thấy TodoController không quan tâm đến TodoService được khởi tạo như thế nào cả, đúng ko? Nó chỉ quan tâm đến việc đón nhận các Requests và sử dụng trực tiếp các methods của **svTodo**.

```js
import { Controller, Get, Put, RequestParam, Delete, Post, RequestBody } from '@kites/rest';
import { TodoService } from './todo.service';

@Controller('/todo')
export class TodoController {

  constructor(public svTodo: TodoService) { }

  @Get('/')
  list() {
    return this.svTodo.getAll();
  }

  @Get('/:id')
  details(@RequestParam('id') task) {
    return this.svTodo.get(task);
  }

  @Post('/')
  create(@RequestBody() body) {
    return this.svTodo.create(body);
  }
  // ....
}
```
TodoService là một **Injectable**. Chúng ta sử dụng decorator `@Injectable` để khai báo rằng đây là một phụ thuộc có thể được truyền vào controller trong quá trình chạy run-time.

```js
import { Injectable } from '@kites/common';

@Injectable()
export class TodoService {
  public getAll(): string {
    return 'Get all todos!!!';
  }

  public create(task: any) {
    console.log('Create task: ', task);
    return { _id: Date.now(), ...task };
  }

  public get(task: string) {
    return `Get details: ${task}`;
  }

  public begin(task: string) {
    return `Start: ${task}`;
  }

  public trash(task: string) {
    return `Move task "${task}" to trash!`;
  }
}
```

# 2. Kites Container, Kỹ thuật Inversion of Control (IoC)

Bên cạnh 4 tính chất của lập trình hướng đối tượng **OOP** thì **IoC** là mẫu thiết kế tuân thủ nguyên lý số 5 **D**ependency Inversion trong nguyên lý thiết kế phần mềm hướng đối tượng [**S.O.L.I.D**](https://toidicodedao.com/2015/03/24/solid-la-gi-ap-dung-cac-nguyen-ly-solid-de-tro-thanh-lap-trinh-vien-code-cung/). Tức là, các Module cấp thấp sẽ được inject (truyền vào) vào Module cấp cao thông qua Constructor hoặc thông qua Properties. 

Như ví dụ ở trên thì `svTodo` được truyền vào Constructor, `task` và `body` được truyền vào dưới dạng tham số của methods.

Như vậy, nếu bạn để ý thì `TodoController` đã ủy nhiệm cho một đơn vị chịu trách nhiệm khởi tạo `TodoService`, đó là **DI Container** hay còn gọi là **IoC Container**.

Kites.js cài đặt một **DI Container** trong core engine, có nhiệm vụ là nạp các phụ thuộc trong quá trình khởi động, quản lý và khởi tạo các sự phụ thuộc khi có yêu cầu.

Tuy nhiên, trong phiên bản hiện tại `v1.1.8`, thì chúng ta phải config auto-mát-tay các Service phụ thuộc trong file `./app.ts`, bằng cách định danh các providers như trong đoạn mã dưới đây:

```js
import { TodoService } from './todo/todo.service';

async function bootstrap() {
  const app = await KitesFactory
    .create({
      providers: [
        TodoService,
      ],
    })
    .use(Express())
    .use(Rest())
    .init();

  app.logger.info(`Server started! Let's browse http://localhost:3000/api/todo`);
}
```

Sau khi **KitesInstance** được tạo, bạn có thể lấy được instance của TodoService, bằng cách gọi lệnh:

```js
const svTodo = app.container.inject(TodoService);
const tasks = svTodo.getAll();
console.log(tasks);
```

# 3. @Injectable() và @Inject()

Như ở trên bạn đã thấy thì **TodoService** là một phụ thuộc có thể truyền vào trong Controller một cách dễ ràng đúng không ạ. Nhưng sẽ ra sao nếu hàm tạo có tham số là kiểu Primitive? Lúc này IOC Container không biết phải khởi tạo và truyền vào hàm tạo giá trị nào cho phù hợp cả. Và khi đó, chúng ta cần sự trợ giúp của decorator `@Inject()` để báo cho rõ cho Container biết đó là một hằng số, một class hay một Factory.

Để hiểu hơn về khái niệm này, mời các bạn ghé trang [tiepphan.com](https://www.tiepphan.com/thu-nghiem-voi-angular-dependency-injection-trong-angular/#32-injectable-v%C3%A0-inject) admin của cộng động Angular Vietnam. Nói rất rõ và dễ hiểu về 2 khái niệm này!

Ví dụ, trong các ứng dụng của Kites.js chúng ta cũng hoàn toàn, có thể truyền vào instance của ứng dụng Kites.js trong hàm tạo của Controller hoặc Service:

```js
import { Inject } from '@kites/common';
import { KITES_INSTANCE, KitesInstance } from '@kites/core';
import { Controller } from '@kites/rest';
import { TodoService } from './todo.service';

@Controller('/todo')
export class TodoController {

  constructor(
    private svTodo: TodoService,
    @Inject(KITES_INSTANCE) private kites: KitesInstance,
  ) {
    this.kites.logger.info('Init todo controller!');
 }

  @Get('/')
  list() {
    this.kites.logger.info('Get all todo list!');
    return this.svTodo.getAll();
  }

}
```

# 4. Providers

Provider là cách mà chúng ta cung cấp thông tin cho DI System biết cách khởi tạo các đối tượng phụ thuộc. Trong phiên bản hiện tại Kites@1.1.8 hỗ trợ khai báo Providers theo các cách sau:

## 4.1 Sử dụng Value

Nếu sử dụng token như sau, value sẽ được truyền vào thay vì tạo instance của class.

```js
{
  provide: 'API_ENDPOINT',
  useValue: 'https://nodejs.vn/api/'
}
```
## 4.2 Sử dụng alias

Sử dụng class như một token:

```js
{
  provide: TodoService,
  useClass: TodoService
},
```

# 4.3 Sử dụng factory

Mỗi lần truy xuất đối tượng phụ thuộc, DI Container sẽ thực thi một function, để trả về thông tin phụ thuộc. Do đó, giá trị trả về có thể thay đổi dựa vào các điều kiện được kiểm tra.

```js
{
  provide: Car,
  useFactory: () => {
    return type === 'Toyota' ? new ToyotaCar() : new BuildCar(type);
  }
}
```

# 5. Services

Nguyên tắc thiết kế Service chúng ta vẫn sử dụng S.O.L.I.D, đó là mỗi một service chỉ chịu một nhiệm vụ nhất định. Ở trên thì `TodoService` chịu trách nhiệm khởi tạo mới, cập nhật và xóa các tác vụ công việc. Như chúng ta đã thấy ví dụ mẫu ở trên và cách nó được sử dụng trong `TodoController`.

Ý tưởng để thiết kế một service rất đơn giản. Nếu bạn có các phần code xử lý business logic – ví dụ gọi API để nhận gửi dữ liệu – đọc, ghi dữ liệu từ CSDL – hoặc có các phần code cần để sử dụng lại, chúng ta sẽ tách các phần đó ra khỏi Controllers và đưa chúng vào services. 

Chúng ta cũng không nên để các Controller phụ thuộc chặt chẽ vào các services, mà thay vào đó sẽ inject thông qua DI system. Bằng cách đó, các Controller có thể phụ thuộc vào Interface – Abstraction – thay vì phụ thuộc vào class cụ thể, giúp dễ dàng kiểm thử, bảo trì, nâng cấp. Trong thực tế, chúng ta thường khai báo các services ở cấp độ Application để sử dụng xuyên suốt trong chương trình.

# Tham khảo

1. [SOLID LÀ GÌ – ÁP DỤNG CÁC NGUYÊN LÝ SOLID ĐỂ TRỞ THÀNH LẬP TRÌNH VIÊN CODE “CỨNG”](https://toidicodedao.com/2015/03/24/solid-la-gi-ap-dung-cac-nguyen-ly-solid-de-tro-thanh-lap-trinh-vien-code-cung/)
2. [Dependency Injection Trong Angular](https://www.tiepphan.com/thu-nghiem-voi-angular-dependency-injection-trong-angular/)#32-injectable-và-inject
3. [Tản mạn về Dependency Injection](https://edwardthienhoang.wordpress.com/2015/03/30/tan-man-ve-dependency-injection/)
