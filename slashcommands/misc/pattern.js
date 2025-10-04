const Discord = require('discord.js');
const ee = require('../../config/embed.json');

module.exports = {
    name: 'pattern',
    description: 'Learn about design patterns with code examples.',
    options: [
        {
            name: 'design-pattern',
            description: 'Design pattern to learn about',
            required: true,
            type: 3,
            choices: [
                { name: 'Singleton', value: 'singleton' },
                { name: 'Observer', value: 'observer' },
                { name: 'Factory', value: 'factory' },
                { name: 'Strategy', value: 'strategy' },
                { name: 'Decorator', value: 'decorator' },
                { name: 'Command', value: 'command' },
                { name: 'MVC', value: 'mvc' },
                { name: 'Repository', value: 'repository' },
                { name: 'Builder', value: 'builder' },
                { name: 'Adapter', value: 'adapter' },
                { name: 'Facade', value: 'facade' },
                { name: 'Proxy', value: 'proxy' },
                { name: 'Chain of Responsibility', value: 'chain' },
                { name: 'State', value: 'state' },
                { name: 'Template Method', value: 'template' },
                { name: 'Visitor', value: 'visitor' },
                { name: 'Mediator', value: 'mediator' },
                { name: 'Memento', value: 'memento' },
                { name: 'Prototype', value: 'prototype' },
                { name: 'Abstract Factory', value: 'abstract-factory' }
            ]
        }
    ],
    usage: '/pattern <design-pattern>',
    execute(interaction) {
        const pattern = interaction.options.getString('design-pattern');
        
        const patterns = {
            singleton: {
                title: '🔒 Singleton Pattern',
                description: 'Ensures a class has only one instance and provides global access to it.',
                example: '```python\nclass Singleton:\n    _instance = None\n    _initialized = False\n    \n    def __new__(cls):\n        if cls._instance is None:\n            cls._instance = super().__new__(cls)\n        return cls._instance\n    \n    def __init__(self):\n        if not self._initialized:\n            self.value = 0\n            self._initialized = True\n    \n    def increment(self):\n        self.value += 1\n\n# Usage\ns1 = Singleton()\ns2 = Singleton()\nprint(s1 is s2)  # True - same instance\n```',
                useCase: 'Database connections, logging, configuration settings'
            },
            observer: {
                title: '👁️ Observer Pattern',
                description: 'Defines a one-to-many dependency between objects so that when one object changes state, all dependents are notified.',
                example: '```python\nclass Subject:\n    def __init__(self):\n        self._observers = []\n        self._state = None\n    \n    def attach(self, observer):\n        self._observers.append(observer)\n    \n    def detach(self, observer):\n        self._observers.remove(observer)\n    \n    def notify(self):\n        for observer in self._observers:\n            observer.update(self._state)\n    \n    def set_state(self, state):\n        self._state = state\n        self.notify()\n\nclass Observer:\n    def __init__(self, name):\n        self.name = name\n    \n    def update(self, state):\n        print(f"{self.name} received: {state}")\n```',
                useCase: 'Event handling, model-view architectures, notifications'
            },
            factory: {
                title: '🏭 Factory Pattern',
                description: 'Creates objects without specifying the exact class to create.',
                example: '```python\nfrom abc import ABC, abstractmethod\n\nclass Animal(ABC):\n    @abstractmethod\n    def make_sound(self):\n        pass\n\nclass Dog(Animal):\n    def make_sound(self):\n        return "Woof!"\n\nclass Cat(Animal):\n    def make_sound(self):\n        return "Meow!"\n\nclass AnimalFactory:\n    @staticmethod\n    def create_animal(animal_type):\n        if animal_type == "dog":\n            return Dog()\n        elif animal_type == "cat":\n            return Cat()\n        else:\n            raise ValueError("Unknown animal type")\n\n# Usage\nanimal = AnimalFactory.create_animal("dog")\nprint(animal.make_sound())  # "Woof!"\n```',
                useCase: 'Object creation, plugin systems, database drivers'
            },
            strategy: {
                title: '🎯 Strategy Pattern',
                description: 'Defines a family of algorithms, encapsulates each one, and makes them interchangeable.',
                example: '```python\nfrom abc import ABC, abstractmethod\n\nclass SortStrategy(ABC):\n    @abstractmethod\n    def sort(self, data):\n        pass\n\nclass BubbleSort(SortStrategy):\n    def sort(self, data):\n        # Bubble sort implementation\n        return sorted(data)  # Simplified\n\nclass QuickSort(SortStrategy):\n    def sort(self, data):\n        # Quick sort implementation\n        return sorted(data)  # Simplified\n\nclass Sorter:\n    def __init__(self, strategy):\n        self._strategy = strategy\n    \n    def set_strategy(self, strategy):\n        self._strategy = strategy\n    \n    def sort(self, data):\n        return self._strategy.sort(data)\n\n# Usage\nsorter = Sorter(BubbleSort())\nresult = sorter.sort([3, 1, 4, 1, 5])\n```',
                useCase: 'Payment processing, sorting algorithms, validation rules'
            },
            decorator: {
                title: '🎨 Decorator Pattern',
                description: 'Adds new functionality to objects dynamically without altering their structure.',
                example: '```python\nfrom abc import ABC, abstractmethod\n\nclass Coffee(ABC):\n    @abstractmethod\n    def cost(self):\n        pass\n    \n    @abstractmethod\n    def description(self):\n        pass\n\nclass SimpleCoffee(Coffee):\n    def cost(self):\n        return 2.0\n    \n    def description(self):\n        return "Simple coffee"\n\nclass CoffeeDecorator(Coffee):\n    def __init__(self, coffee):\n        self._coffee = coffee\n\nclass MilkDecorator(CoffeeDecorator):\n    def cost(self):\n        return self._coffee.cost() + 0.5\n    \n    def description(self):\n        return self._coffee.description() + ", milk"\n\n# Usage\ncoffee = SimpleCoffee()\ncoffee_with_milk = MilkDecorator(coffee)\nprint(f"{coffee_with_milk.description()}: ${coffee_with_milk.cost()}")\n```',
                useCase: 'UI components, middleware, feature extensions'
            },
            command: {
                title: '⚡ Command Pattern',
                description: 'Encapsulates a request as an object, allowing you to parameterize clients with different requests.',
                example: '```python\nfrom abc import ABC, abstractmethod\n\nclass Command(ABC):\n    @abstractmethod\n    def execute(self):\n        pass\n    \n    @abstractmethod\n    def undo(self):\n        pass\n\nclass Light:\n    def __init__(self):\n        self.is_on = False\n    \n    def turn_on(self):\n        self.is_on = True\n        print("Light is ON")\n    \n    def turn_off(self):\n        self.is_on = False\n        print("Light is OFF")\n\nclass LightOnCommand(Command):\n    def __init__(self, light):\n        self.light = light\n    \n    def execute(self):\n        self.light.turn_on()\n    \n    def undo(self):\n        self.light.turn_off()\n\nclass RemoteControl:\n    def __init__(self):\n        self.command = None\n    \n    def set_command(self, command):\n        self.command = command\n    \n    def press_button(self):\n        self.command.execute()\n```',
                useCase: 'GUI buttons, macro recording, undo operations'
            },
            mvc: {
                title: '🏗️ MVC Pattern',
                description: 'Separates application logic into three interconnected components: Model, View, and Controller.',
                example: '```python\n# Model\nclass UserModel:\n    def __init__(self):\n        self.users = []\n    \n    def add_user(self, name, email):\n        user = {"name": name, "email": email}\n        self.users.append(user)\n        return user\n    \n    def get_users(self):\n        return self.users\n\n# View\nclass UserView:\n    def display_users(self, users):\n        print("Users:")\n        for user in users:\n            print(f"- {user[\'name\']} ({user[\'email\']})")\n    \n    def display_message(self, message):\n        print(message)\n\n# Controller\nclass UserController:\n    def __init__(self, model, view):\n        self.model = model\n        self.view = view\n    \n    def add_user(self, name, email):\n        user = self.model.add_user(name, email)\n        self.view.display_message(f"Added user: {name}")\n    \n    def show_users(self):\n        users = self.model.get_users()\n        self.view.display_users(users)\n```',
                useCase: 'Web applications, desktop applications, API design'
            },
            repository: {
                title: '📚 Repository Pattern',
                description: 'Encapsulates the logic needed to access data sources, centralizing common data access functionality.',
                example: '```python\nfrom abc import ABC, abstractmethod\n\nclass UserRepository(ABC):\n    @abstractmethod\n    def save(self, user):\n        pass\n    \n    @abstractmethod\n    def find_by_id(self, user_id):\n        pass\n    \n    @abstractmethod\n    def find_all(self):\n        pass\n\nclass InMemoryUserRepository(UserRepository):\n    def __init__(self):\n        self.users = {}\n        self.next_id = 1\n    \n    def save(self, user):\n        if \'id\' not in user:\n            user[\'id\'] = self.next_id\n            self.next_id += 1\n        self.users[user[\'id\']] = user\n        return user\n    \n    def find_by_id(self, user_id):\n        return self.users.get(user_id)\n    \n    def find_all(self):\n        return list(self.users.values())\n\nclass DatabaseUserRepository(UserRepository):\n    def save(self, user):\n        # Database save logic\n        pass\n    \n    def find_by_id(self, user_id):\n        # Database query logic\n        pass\n```',
                useCase: 'Data access layer, testing with mock data, database abstraction'
            },
            builder: {
                title: '🔨 Builder Pattern',
                description: 'Constructs complex objects step by step, allowing you to produce different types and representations.',
                example: '```python\nclass Car:\n    def __init__(self):\n        self.engine = None\n        self.wheels = None\n        self.doors = None\n        self.color = None\n    \n    def __str__(self):\n        return f"Car: {self.color}, {self.engine}, {self.wheels} wheels, {self.doors} doors"\n\nclass CarBuilder:\n    def __init__(self):\n        self.car = Car()\n    \n    def set_engine(self, engine):\n        self.car.engine = engine\n        return self\n    \n    def set_wheels(self, wheels):\n        self.car.wheels = wheels\n        return self\n    \n    def set_doors(self, doors):\n        self.car.doors = doors\n        return self\n    \n    def set_color(self, color):\n        self.car.color = color\n        return self\n    \n    def build(self):\n        return self.car\n\n# Usage\ncar = CarBuilder().set_engine("V8").set_wheels(4).set_doors(2).set_color("Red").build()\n```',
                useCase: 'Complex object construction, fluent APIs, configuration objects'
            },
            adapter: {
                title: '🔌 Adapter Pattern',
                description: 'Allows incompatible interfaces to work together by wrapping an existing class with a new interface.',
                example: '```python\nclass OldPrinter:\n    def old_print(self, text):\n        print(f"Old printer: {text}")\n\nclass NewPrinter:\n    def print(self, text):\n        print(f"New printer: {text}")\n\nclass PrinterAdapter:\n    def __init__(self, old_printer):\n        self.old_printer = old_printer\n    \n    def print(self, text):\n        self.old_printer.old_print(text)\n\n# Usage\nold_printer = OldPrinter()\nadapter = PrinterAdapter(old_printer)\nnew_printer = NewPrinter()\n\n# Both can be used with the same interface\nprinters = [adapter, new_printer]\nfor printer in printers:\n    printer.print("Hello World")\n```',
                useCase: 'Legacy system integration, third-party library wrapping, API compatibility'
            },
            facade: {
                title: '🏢 Facade Pattern',
                description: 'Provides a simplified interface to a complex subsystem.',
                example: '```python\nclass CPU:\n    def freeze(self):\n        print("CPU frozen")\n    \n    def jump(self, position):\n        print(f"CPU jumping to {position}")\n    \n    def execute(self):\n        print("CPU executing")\n\nclass Memory:\n    def load(self, position, data):\n        print(f"Memory loading {data} at {position}")\n\nclass HardDrive:\n    def read(self, lba, size):\n        return f"Data from sector {lba}"\n\nclass ComputerFacade:\n    def __init__(self):\n        self.cpu = CPU()\n        self.memory = Memory()\n        self.hard_drive = HardDrive()\n    \n    def start(self):\n        self.cpu.freeze()\n        data = self.hard_drive.read(0, 1024)\n        self.memory.load(0, data)\n        self.cpu.jump(0)\n        self.cpu.execute()\n\n# Usage\ncomputer = ComputerFacade()\ncomputer.start()  # Simple interface to complex startup\n```',
                useCase: 'System APIs, complex library wrappers, unified interfaces'
            },
            proxy: {
                title: '🔗 Proxy Pattern',
                description: 'Controls access to a resource, allowing you to delay its creation or control its usage.',
                example: '```python\nfrom abc import ABC, abstractmethod\n\nclass Subject(ABC):\n    @abstractmethod\n    def request(self):\n        pass\n\nclass RealSubject(Subject):\n    def request(self):\n        print("RealSubject: Handling request")\n        return "Real data"\n\nclass Proxy(Subject):\n    def __init__(self, real_subject):\n        self._real_subject = real_subject\n        self._cached_result = None\n    \n    def request(self):\n        if self._cached_result is None:\n            print("Proxy: First request - loading data")\n            self._cached_result = self._real_subject.request()\n        else:\n            print("Proxy: Returning cached data")\n        return self._cached_result\n\n# Usage\nreal_subject = RealSubject()\nproxy = Proxy(real_subject)\n\n# First call loads data\nresult1 = proxy.request()\n# Second call returns cached data\nresult2 = proxy.request()\n```',
                useCase: 'Lazy loading, caching, access control, logging'
            }
        };

        const selectedPattern = patterns[pattern];
        
        if (!selectedPattern) {
            const embed = new Discord.EmbedBuilder()
                .setColor(0x008080)
                .setTitle('❌ Pattern Not Found')
                .setDescription('The requested design pattern is not available yet. Please choose from the available options.')
                .setFooter({ text: ee.footertext, iconURL: ee.footericon });
            
            return interaction.reply({ embeds: [embed] });
        }

        const embed = new Discord.EmbedBuilder()
            .setColor(0x008080)
            .setTitle(selectedPattern.title)
            .setDescription(selectedPattern.description)
            .addFields(
                {
                    name: '💻 Implementation Example',
                    value: selectedPattern.example,
                    inline: false
                },
                {
                    name: '🎯 Common Use Cases',
                    value: selectedPattern.useCase,
                    inline: false
                },
                {
                    name: '📚 Pattern Benefits',
                    value: '• Promotes code reusability\n• Improves maintainability\n• Provides proven solutions\n• Enhances code organization',
                    inline: false
                }
            )
            .setFooter({ text: ee.footertext, iconURL: ee.footericon });

        interaction.reply({ embeds: [embed] });
    }
};
