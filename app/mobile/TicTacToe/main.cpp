#include <QGuiApplication>
#include <QQmlApplicationEngine>
//#include <QQmlContext>
//#include <QQmlPropertyMap>

int main(int argc, char *argv[])
{
    QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
    QGuiApplication app(argc, argv);

    QQmlApplicationEngine engine;
//    QQmlPropertyMap sysInfo;
//    sysInfo.insert("productType", QSysInfo::productType());
//    engine.rootContext()->setContextProperty("sysInfo", &sysInfo);
    engine.load(QUrl(QLatin1String("qrc:/main.qml")));

    return app.exec();
}
