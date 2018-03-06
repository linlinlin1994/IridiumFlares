package com.cmps263.project.crawler;

import com.cmps263.project.commons.FileConstants;
import com.cmps263.project.commons.PageConstants;
import com.cmps263.project.commons.URLConstants;
import org.openqa.selenium.*;
import org.openqa.selenium.phantomjs.PhantomJSDriver;
import org.openqa.selenium.phantomjs.PhantomJSDriverService;
import org.openqa.selenium.remote.DesiredCapabilities;
import java.io.*;
import java.util.ArrayList;
import java.util.List;

public class IridiumFlareCrawler {

    WebDriver driver;

    public static void main(String[] args){
        IridiumFlareCrawler crawler = new IridiumFlareCrawler();
        crawler.init();
        crawler.crawl();
    }

    private void init(){
        driver = initDriver(driver);
    }

    private void crawl(){
        try {
            List<String> timeRecordsCollection = new ArrayList<String>();
            BufferedReader bufferedReader = new BufferedReader(new FileReader(FileConstants.CITIES_LOCATION_FILE_PATH));
            String line = null;
            while ((line = bufferedReader.readLine()) != null) {
                if(line.equals(FileConstants.CITIES_LOCATION_FILE_HEADER)){
                    continue;
                }else {
                    String[] benchInfo = line.split(",");
                    System.out.println("Processing " + benchInfo[0]);
                    openPage(driver, "lat=" + benchInfo[2] + "&lng=" + benchInfo[3]);
                    List<String> timeRecords = getFlareInfo(driver, benchInfo);
                    timeRecordsCollection.addAll(timeRecords);
                }
            }
        }catch (Exception e){
            e.printStackTrace();
        }
    }

    private WebDriver initDriver(WebDriver driver){
        DesiredCapabilities caps = new DesiredCapabilities();
        caps.setJavascriptEnabled(true);
        caps.setCapability(PhantomJSDriverService.PHANTOMJS_EXECUTABLE_PATH_PROPERTY, "/usr/local/bin/phantomjs");
        return new PhantomJSDriver(caps);
    }

    private void openPage(WebDriver driver, String postFix){
        driver.get(URLConstants.FLARE_WEBSITE + postFix);
    }

    private List<String> getFlareInfo(WebDriver driver, String[] benchInfo){
        List<String> timeRecords = new ArrayList<String>();
        List<WebElement> flareInfos = driver.findElements(By.xpath(PageConstants.FLARES_TRS_LOCATOR));
        for(WebElement flareInfo: flareInfos){
            StringBuilder timeRecord = new StringBuilder();
            timeRecord.append(flareInfo.findElement(By.xpath(".//td[1]/a")).getText() + ",");
            timeRecord.append(flareInfo.findElement(By.xpath(".//td[2]")).getText() + ",");
            timeRecord.append(flareInfo.findElement(By.xpath(".//td[3]")).getText() + ",");
            timeRecord.append(flareInfo.findElement(By.xpath(".//td[4]")).getText() + ",");
            timeRecord.append(flareInfo.findElement(By.xpath(".//td[5]")).getText() + ",");
            timeRecord.append(flareInfo.findElement(By.xpath(".//td[6]")).getText() + ",");
            timeRecord.append(flareInfo.findElement(By.xpath(".//td[7]")).getText() + ",");
            timeRecord.append(flareInfo.findElement(By.xpath(".//td[8]")).getText() + ",");
            timeRecord.append(benchInfo[0] + ",");
            timeRecord.append(benchInfo[1] + ",");
            timeRecord.append(benchInfo[2] + ",");
            timeRecord.append(benchInfo[3] + ",");
            timeRecords.add(timeRecord.toString());
            System.out.println(timeRecord.toString());
        }
        return timeRecords;
    }

}
